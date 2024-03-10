use anchor_lang::prelude::*;

declare_id!("8qqaDkqb7UsrQTLeoVoW4wH8E7YNNqQp6d6fkkWrLX4Q");

pub mod state;
pub mod contexts;

pub use contexts::*;

#[program]
pub mod anchor_escrow {
    use super::*;

    pub fn make(ctx: Context<Make>, seed: u64, amount_x: u64, amount_y: u64) -> Result<()> {
       
        ctx.accounts.make(seed, amount_y, amount_x, &ctx.bumps)?;
        ctx.accounts.transfer()
    }

    pub fn refund(ctx: Context<Refund>) -> Result<()> {
       
        ctx.accounts.close()?;
        ctx.accounts.close_vault()
    }

    pub fn take(ctx: Context<Take>) -> Result<()> {
       
        ctx.accounts.pay_back()?;
        ctx.accounts.take()
    }
}

#[derive(Accounts)]
pub struct Initialize {}
