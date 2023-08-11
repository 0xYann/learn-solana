use solana_program::{program_error::ProgramError};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum TicketError{
    // Error 0
    #[error("PDA derived not equal to PDA passed in")]
    InvalidPDA
}

impl From<TicketError> for ProgramError {
    fn from(e: TicketError) -> Self {
        ProgramError::Custom(e as u32)
    }
}