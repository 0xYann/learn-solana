use borsh::BorshDeserialize;
use solana_program::program_error::ProgramError;

pub enum TicketInstruction {
    ShowTicket {
        id: u8,
        event: String,
        place: String,
    },
}

#[derive(BorshDeserialize)]
struct TicketManagmentPayload {
    id: u8,
    event: String,
    place: String,
}

impl TicketInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (&selector, rest) = input
            .split_first()
            .ok_or(ProgramError::InvalidInstructionData)?;
        let payload = TicketManagmentPayload::try_from_slice(rest).unwrap();
        Ok(match selector {
            0 => Self::ShowTicket {
                id: payload.id,
                event: payload.event,
                place: payload.place,
            },
            _ => return Err(ProgramError::InvalidInstructionData),
        })
    }
}
