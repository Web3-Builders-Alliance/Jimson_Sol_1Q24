use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token_interface::{Mint, TokenAccount, TokenInterface}}; 

use crate::state::Config;
use crate::error::AmmError;

#[derive(Accounts)]
#[instruction(seed:u64)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub mint_x: Box<InterfaceAccount<'info, Mint>>,
    pub mint_y: Box<InterfaceAccount<'info, Mint>>,
    #[account(
        init,
        seeds = [b"lp", config.key().as_ref()],
        payer = initializer,
        bump,
        mint::decimals = 6,
        mint::authority = auth
    )]
    pub mint_lp: Box<InterfaceAccount<'info, Mint>>,
    #[account(
        init,
        payer = initializer,
        associated_token::mint = mint_x,
        associated_token::authority = auth
    )]
    pub vault_x: Box<InterfaceAccount<'info,TokenAccount>>,
    #[account(
        init,
        payer = initializer,
        associated_token::mint = mint_y,
        associated_token::authority = auth
    )]
    pub vault_y: Box<InterfaceAccount<'info, TokenAccount>>,
    ///CHECK: used for signing.
    #[account(
        seeds = [b"auth"],
        bump
    )]
    pub auth: UncheckedAccount<'info>,
    #[account(
        init,
        payer = initializer,
        seeds = [b"config", seed.to_le_bytes().as_ref()],
        bump,
        space = Config::INIT_SPACE
    )]
    pub config: Account<'info, Config>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}
    



pub fn handler(ctx: Context<Initialize>, seed: u64, fee: u16, authority: Option<Pubkey>, ) -> Result<()> {
    require!(fee <= 10000, AmmError::InvalidFee);
    ctx.accounts.config.set_inner(Config {
        seed,
        fee,
        authority,
        mint_x: ctx.accounts.mint_x.key(),
        mint_y: ctx.accounts.mint_y.key(),
        locked: false,
        auth_bump: ctx.bumps.auth,
        lp_bump: ctx.bumps.mint_lp,
        config_bump: ctx.bumps.config,
    });

    Ok(())
}