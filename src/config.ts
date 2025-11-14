import dotenv from 'dotenv';

dotenv.config(); 

export class config {
/*---------------------------------------------------------------------------------*/
                                /*TOKENS / IDS*/ 
/*---------------------------------------------------------------------------------*/
    public static readonly TOKEN: string = process.env.token || '';
    public static readonly TRANSCRIPT: string = process.env.transcript || '';
    public static readonly REACTIONROLE: string = process.env.reactionrole || '';
    public static readonly VOTING: string = process.env.voting || '';
    public static readonly ARCHIVES: string = process.env.archives || '';
    public static readonly APPROVAL: string = process.env.approval || '';
    public static readonly LOGS: string = process.env.logs || '';
    public static readonly COMMANDS: string = process.env.commands || '';
    public static readonly GUILD: string = process.env.guild || '';
    public static readonly WLROLE: string = process.env.wlrole || '';
    public static readonly TICKETOPEN: string = process.env.ticketopen || '';
    public static readonly TICKETCLOSE: string = process.env.ticketclose || '';
    public static readonly STAFFROLE: string = process.env.staffrole || '';
    public static readonly WELCOMECHANNEL: string = process.env.welcomechannel || '';
    public static readonly PRIOROLE: string = process.env.priorole || '';
    public static readonly WHITELISTROLE: string = process.env.whitelistrole || '';


/*---------------------------------------------------------------------------------*/
                                /*NUMBER VALUES*/ 
/*---------------------------------------------------------------------------------*/

    public static readonly VOTELIMIT: number = 2;
}