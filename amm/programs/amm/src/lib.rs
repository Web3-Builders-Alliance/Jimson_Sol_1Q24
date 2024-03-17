pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;
pub mod helpers;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("H8smav211zHmLvHBMwrvGkd2LtZ811Ban9HpHKpeuosp");

#[program]
pub mod amm {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>, 
        seed: u64, 
        fee: u16, 
        authority: Option<Pubkey>,
    ) -> Result<()> {
        initialize::handler(ctx, seed, fee, authority)
    }

    pub fn deposit(
        ctx: Context<Deposit>, 
        amount: u64, // Amount of lp tokens to claim
        max_x: u64, // Max amount of X we are willing to deposit
        max_y: u64, // Max amount of Y we are willing to deposit
        expiration: i64,
    ) -> Result<()> {
        ctx.accounts.deposit(amount, max_x, max_y, expiration)
    }

    pub fn withdraw(
        ctx: Context<Withdraw>, 
        amount: u64, // Amount of lp tokens to claim
        min_x: u64, // Max amount of X we are willing to deposit
        min_y: u64, // Max amount of Y we are willing to deposit
        expiration: i64,
    ) -> Result<()> {
        ctx.accounts.withdraw(amount, min_x, min_y, expiration)
    }

    pub fn swap(
        ctx: Context<Swap>, 
        is_x: bool, 
        amount: u64, 
        min: u64, 
        expiration: i64,
    ) -> Result<()> {
        ctx.accounts.swap(is_x, amount, min, expiration)
    }

    pub fn lock(
        ctx: Context<Update>, 
       
    ) -> Result<()> {
        ctx.accounts.lock()
    }

    pub fn unlock(
        ctx: Context<Update>,
    ) -> Result<()> {
        ctx.accounts.unlock()
    }
}
