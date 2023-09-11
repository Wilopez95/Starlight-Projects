import { IHaulingServiceItemsParams } from '@root/api/haulingServiceItems/types';

export const getStoredFiltering = () => {
    const storedFiltering = localStorage.getItem('master-routes-filtering');
    if (storedFiltering) {
        const time = new Date().getTime();
        const storedFilteringParsed = JSON.parse(storedFiltering);
        if ((time - storedFilteringParsed.lastSync) < 7200000){
            localStorage.setItem('master-routes-filtering', JSON.stringify({
                filter: storedFilteringParsed.filter,
                lastSync: time
            }));
            return storedFilteringParsed.filter;
        } else {
            return null;
        }
    }
    return null;
};

export const setStoredFiltering = (filterOptions: IHaulingServiceItemsParams) => {
    const time = new Date().getTime();
    localStorage.setItem('master-routes-filtering', JSON.stringify({
        filter: filterOptions,
        lastSync: time
    }));
};