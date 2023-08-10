use solana_program::{
    account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, msg, pubkey::Pubkey,
};
pub mod instruction;
use instruction::TicketInstruction;

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = TicketInstruction::unpack(instruction_data)?;
    match instruction {
        TicketInstruction::ShowTicket { id, event, place } => {
            show_ticket(program_id, accounts, id, event, place)
        }
    }
}

pub fn show_ticket(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    id: u8,
    event: String,
    place: String,
) -> ProgramResult {
    msg!("Showing ticket details...");
    msg!("Id: {}", id);
    msg!("Event: {}", event);
    msg!("Place: {}", place);

    Ok(())
}
