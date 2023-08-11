use borsh::BorshSerialize;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    borsh::try_from_slice_unchecked,
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::invoke_signed,
    pubkey::Pubkey,
    system_instruction,
    sysvar::{rent::Rent, Sysvar},
};
use std::convert::TryInto;
pub mod instruction;
pub mod ticket;
use instruction::TicketInstruction;
use ticket::Ticket;

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = TicketInstruction::unpack(instruction_data)?;
    match instruction {
        TicketInstruction::ShowTicket { id, event } => show_ticket(id, event),
        TicketInstruction::CreateTicket {
            id,
            owner,
            event,
            place,
        } => create_ticket(program_id, accounts, id, owner, event, place),
    }
}

pub fn show_ticket(id: u8, event: String) -> ProgramResult {
    msg!("Showing ticket details...");
    msg!("Id: {}", id);
    // msg!("Owner: {}", owner);
    msg!("Event: {}", event);
    // msg!("Place: {}", place);

    Ok(())
}

pub fn create_ticket(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    id: u8,
    owner: Pubkey,
    event: String,
    place: String,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();

    let creator = next_account_info(account_info_iter)?;
    let pda_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    let (pda, bump_seed) = Pubkey::find_program_address(
        &[creator.key.as_ref(), &[id], event.as_bytes().as_ref()],
        program_id,
    );

    let account_len: usize = 1 + 32 + (4 + event.len()) + (4 + place.len());
    let rent = Rent::get()?;
    let rent_lamports = rent.minimum_balance(account_len);

    invoke_signed(
        &system_instruction::create_account(
            creator.key,
            pda_account.key,
            rent_lamports,
            account_len.try_into().unwrap(),
            program_id,
        ),
        &[creator.clone(), pda_account.clone(), system_program.clone()],
        &[&[
            creator.key.as_ref(),
            &[id],
            event.as_bytes().as_ref(),
            &[bump_seed],
        ]],
    )?;

    msg!("PDA created: {}", pda);

    let mut account_data = try_from_slice_unchecked::<Ticket>(&pda_account.data.borrow()).unwrap();
    account_data.id = id;
    account_data.owner = owner;
    account_data.event = event;
    account_data.place = place;
    account_data.serialize(&mut &mut pda_account.data.borrow_mut()[..])?;

    Ok(())
}
