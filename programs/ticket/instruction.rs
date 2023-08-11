use borsh::BorshDeserialize;
use solana_program::{program_error::ProgramError, pubkey::Pubkey};

pub enum TicketInstruction {
    ShowTicket {
        id: u8,
        event: String,
    },
    CreateTicket {
        id: u8,
        owner: Pubkey,
        event: String,
        place: String,
    },
}

#[derive(BorshDeserialize)]
struct TicketPayload {
    id: u8,
    owner: Pubkey,
    event: String,
    place: String,
}

impl TicketInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (&selector, rest) = input
            .split_first()
            .ok_or(ProgramError::InvalidInstructionData)?;
        let payload = TicketPayload::try_from_slice(rest).unwrap();
        Ok(match selector {
            0 => Self::ShowTicket {
                id: payload.id,
                event: payload.event,
            },
            1 => Self::CreateTicket {
                id: payload.id,
                owner: payload.owner,
                event: payload.event,
                place: payload.place,
            },
            _ => return Err(ProgramError::InvalidInstructionData),
        })
    }
}
