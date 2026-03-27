import { createSelector } from 'reselect';

const selectPromoterState = (state) => state.promoter;

export const selectAllPromoters = createSelector([selectPromoterState], (promoter) =>
  promoter.allIds.map((id) => promoter.byId[id]).filter(Boolean)
);
