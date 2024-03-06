use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("BgFk9iYaLydCe62an4JBQ9ccdv9nR9GG9aXD39nn18Dr");

#[program]
pub mod vault {
    

    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.vault_state.maker = ctx.accounts.maker.key();
        ctx.accounts.vault_state.taker = ctx.accounts.taker.key();
        ctx.accounts.vault_state.state_bump = ctx.bumps.vault_state;
        ctx.accounts.vault_state.vault_bump = ctx.bumps.vault;

        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.maker.to_account_info(),
            to: ctx.accounts.vault.to_account_info()
        };

        let cpi_program = ctx.accounts.system_program.to_account_info();

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        transfer(cpi_ctx, amount)
    }

    pub fn cancel(ctx: Context<Cancel>) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.maker.to_account_info(),
            
        };

        let cpi_program = ctx.accounts.system_program.to_account_info();

        let bump = ctx.accounts.vault_state.state_bump;
        let seeds = &[
            "vault".as_bytes(),
            &ctx.accounts.vault_state.maker.to_bytes(),
            &[bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        let amount = ctx.accounts.vault.to_account_info().lamports();

        transfer(cpi_ctx, amount)
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.taker.to_account_info(),
            
        };

        let cpi_program = ctx.accounts.system_program.to_account_info();

        let bump = ctx.accounts.vault_state.state_bump;
        let seeds = &[
            "vault".as_bytes(),
            &ctx.accounts.vault_state.maker.to_bytes(),
            &[bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        let amount = ctx.accounts.vault.to_account_info().lamports();

        transfer(cpi_ctx, amount)
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub maker:  Signer<'info>,
    #[account(
        init,
        seeds = [b"VaultState", maker.key().as_ref()],
        bump,
        payer = maker,
        space = VaultState::INIT_SPACE
    )]
    pub vault_state: Account<'info, VaultState>,
    #[account(
        mut,
        seeds = [b"vault", maker.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,
    pub taker: SystemAccount<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]

pub struct Deposit<'info> {
    #[account(
    mut,
    seeds = [b"vault", maker.key().as_ref()],
    bump = vault_state.vault_bump
)]
    pub vault: SystemAccount<'info>,
    #[account(mut)]
    pub maker: Signer<'info>,
    pub taker: SystemAccount<'info>,
    #[account(
        mut,
        has_one = maker,
        seeds =[b"VaultState", maker.key().as_ref()],
        bump = vault_state.state_bump,
    )]
    pub vault_state: Account<'info, VaultState>,
    pub system_program: Program<'info, System>
}


#[derive(Accounts)]

pub struct Cancel<'info> {
    #[account(
    mut,
    seeds = [b"vault", maker.key().as_ref()],
    bump = vault_state.vault_bump
)]
    pub vault: SystemAccount<'info>,
    #[account(mut)]
    pub maker: Signer<'info>,
    #[account(
        mut,
        has_one = maker,
        seeds =[b"VaultState", maker.key().as_ref()],
        bump = vault_state.state_bump,
        close = maker,
    )]
    pub vault_state: Account<'info, VaultState>,
    pub system_program: Program<'info, System>
}


#[derive(Accounts)]

pub struct Withdraw<'info> {
    #[account(
    mut,
    seeds = [b"vault", maker.key().as_ref()],
    bump = vault_state.vault_bump
)]
    pub vault: SystemAccount<'info>,
    #[account(mut)]
    pub taker: Signer<'info>,
    #[account(mut)]
    pub maker: SystemAccount<'info>,
    #[account(
        mut,
        has_one = taker,
        seeds =[b"VaultState", maker.key().as_ref()],
        bump = vault_state.state_bump,
        close = maker
    )]
    pub vault_state: Account<'info, VaultState>,
    pub system_program: Program<'info, System>
}



#[account]
pub struct  VaultState {
    pub maker: Pubkey,
    pub taker: Pubkey,
    pub seed: u64,
    pub state_bump: u8,
    pub vault_keeper: Pubkey,
    pub vault_bump: u8,
    pub created_at: i64,
    pub amount: u64,
    pub lock_seconds: i64,
}

impl Space for VaultState {
    const INIT_SPACE: usize = 8 + 32 + 32 + 8 + 1 + 32 + 1 + 8 + 8 + 8;
}