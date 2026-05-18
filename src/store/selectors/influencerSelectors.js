import { createSelector } from 'reselect';

const selectInfluencerState = (state) => state.influencer;

export const selectAllInfluencers = createSelector([selectInfluencerState], (influencer) =>
  influencer.allIds.map((id) => influencer.byId[id]).filter(Boolean)
);
