//-------------------------------------------------------------------------------
///
/// TASK: Implement the remove reaction functionality for the Twitter program
/// 
/// Requirements:
/// - Verify that the tweet reaction exists and belongs to the reaction author
/// - Decrement the appropriate counter (likes or dislikes) on the tweet
/// - Close the tweet reaction account and return rent to reaction author
/// 
///-------------------------------------------------------------------------------

use anchor_lang::prelude::*;

use crate::errors::TwitterError;
use crate::states::*;

pub fn remove_reaction(ctx: Context<RemoveReactionContext>) -> Result<()> {
    let tweet_reaction = &ctx.accounts.tweet_reaction;
    let tweet = &mut ctx.accounts.tweet;
    
    // Decrement appropriate counter based on reaction type
    match &tweet_reaction.reaction {
        ReactionType::Like => {
            require!(
                tweet.likes > 0,
                TwitterError::MinLikesReached
            );
            tweet.likes = tweet.likes.checked_sub(1).unwrap();
        }
        ReactionType::Dislike => {
            require!(
                tweet.dislikes > 0,
                TwitterError::MinDislikesReached
            );
            tweet.dislikes = tweet.dislikes.checked_sub(1).unwrap();
        }
    }
    
    Ok(())
}

#[derive(Accounts)]
pub struct RemoveReactionContext<'info> {
    #[account(mut)]
    pub reaction_author: Signer<'info>,
    #[account(
        mut,
        has_one = reaction_author,
        close = reaction_author
    )]
    pub tweet_reaction: Account<'info, Reaction>,
    #[account(mut)]
    pub tweet: Account<'info, Tweet>,
}
