use anchor_lang::prelude::*;

#[account]
pub struct Config {
    pub seed: u64, //8
    pub authority: Option<Pubkey>, //1 + 32
    pub mint_x: Pubkey,
    pub mint_y: Pubkey,
    pub fee: u16, //swap fee in basis points 10000 = 100%
    pub locked: bool,
    pub auth_bump: u8,
    pub config_bump: u8,
    pub lp_bump: u8,
}

impl Space for Config {
    const INIT_SPACE: usize = 8 + 8 + 33 + 32 + 32 + 2 + 4;
}