use anchor_lang::prelude::*;
use anchor_spl::token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked, close_account, CloseAccount};

use crate::state::Escrow;

#[derive(Accounts)]

pub struct Refund<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    pub mint_x: InterfaceAccount<'info, Mint>,
    pub mint_y: InterfaceAccount<'info, Mint>,
    #[account(
        mut,
        associated_token::mint = escrow.mint_x,
        associated_token::authority = escrow
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        has_one = mint_x,
        has_one = mint_y,
        close = maker,
        seeds = [b"escrow", maker.key().as_ref(), escrow.seed.to_le_bytes().as_ref()],
        bump = escrow.escrow_bump,
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(
        mut,
        associated_token::mint = mint_x,
        associated_token::authority = maker,
    )]
    pub maker_ata_x: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>
}

impl<'info> Refund<'info> {
    pub fn close(&mut self) -> Result<()> {
        let cpi_accounts = TransferChecked {
            from: self.vault.to_account_info(),
            to: self.maker_ata_x.to_account_info(),
            mint: self.mint_x.to_account_info(),
            authority: self.escrow.to_account_info(),
        };
         let cpi_program = self.token_program.to_account_info();

         let signer_seeds: &[&[&[u8]]]  = &[&[
            b"escrow",
            self.maker.to_account_info().key.as_ref(),
            &self.escrow.seed.to_le_bytes(),
            &[self.escrow.escrow_bump],
         ]];

         let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

         transfer_checked(cpi_ctx, self.escrow.amount_x, self.mint_x.decimals)
    }


    pub fn close_vault(&mut self) -> Result<()> {
        let cpi_accounts = CloseAccount {
            account: self.vault.to_account_info(),
            destination: self.maker.to_account_info(),
            authority: self.escrow.to_account_info()
        };

        let cpi_program = self.token_program.to_account_info();

         let signer_seeds: &[&[&[u8]]]  = &[&[
            b"escrow",
            self.maker.to_account_info().key.as_ref(),
            &self.escrow.seed.to_le_bytes(),
            &[self.escrow.escrow_bump],
         ]];

         let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

         close_account(cpi_ctx)
    }
}