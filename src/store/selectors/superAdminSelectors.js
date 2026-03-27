import { createSelector } from 'reselect';

const selectSuperAdminState = (state) => state.superAdmin;

export const selectSponsors = createSelector([selectSuperAdminState], (superAdmin) => superAdmin.sponsors);
export const selectVideoBytes = createSelector([selectSuperAdminState], (superAdmin) => superAdmin.videoBytes);
export const selectPromoCodes = createSelector([selectSuperAdminState], (superAdmin) => superAdmin.promoCodes);
