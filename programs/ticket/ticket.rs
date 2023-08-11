use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize, BorshDeserialize)]
pub struct Ticket {
    pub id: u8,
    pub owner: Pubkey,
    pub event: String,
    pub place: String,
}
