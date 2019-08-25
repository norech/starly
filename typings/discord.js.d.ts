declare module 'discord.js' {
    export interface TextChannel {

        // missing in default typings
        rateLimitPerUser: number;
        
    }
}