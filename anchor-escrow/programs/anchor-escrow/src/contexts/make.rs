use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token_interface::{Mint, TokenAccount, TokenInterface, TransferChecked, transfer_checked}};

use crate::state::Escrow;

#[derive(Accounts)]
#[instruction(seed: u64)]
pub struct Make<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    #[account(
        init,
        payer = maker,
        seeds = [b"escrow", maker.key().as_ref(), seed.to_le_bytes().as_ref()],
        space = Escrow::INIT_SPACE,
        bump,
    )]
    pub escrow: Account<'info, Escrow>,
    pub mint_x: InterfaceAccount<'info, Mint>,
    pub mint_y: InterfaceAccount<'info, Mint>,
    #[account(
        init,
        payer = maker,
        associated_token::mint = mint_x,
        associated_token::authority = escrow,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = mint_x,
        associated_token::authority =maker
    )]
    pub maker_ata_x: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = maker,
        associated_token::mint = mint_y,
        associated_token::authority = maker,
    )]
    pub maker_ata_y: InterfaceAccount<'info, TokenAccount>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub  token_program: Interface<'info, TokenInterface>,
}



impl<'info> Make<'info> {
    pub fn make(&mut self, amount_x: u64, amount_y: u64, seed: u64, bumbs: &MakeBumps) -> Result<()> {
        self.escrow.set_inner(Escrow {
            
            maker: self.maker.to_account_info().key(),
            vault: self.vault.key(),
            mint_x: self.mint_x.to_account_info().key(),
            mint_y: self.mint_y.to_account_info().key(),
            amount_x,
            amount_y,
            seed,
            escrow_bump: bumbs.escrow,
        });

        // Transfer the  amount of  mint_x from the maker to the escrow

        Ok(())
    }

    pub fn transfer(&mut self) -> Result<()> {
        let cpi_program = self.token_program.to_account_info();

        let cpi_accounts = TransferChecked {
            from: self.maker_ata_x.to_account_info(),
            to: self.vault.to_account_info(),
            authority: self.maker.to_account_info(),
            mint: self.mint_x.to_account_info(),
        };

        let  cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        transfer_checked(cpi_ctx, self.escrow.amount_x, self.mint_x.decimals)
    }
}