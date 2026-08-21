import { API_RESOURCES } from '../../constants';

export enum DEFAULT_API_PATHS {
    BY_ID = ':_id',
}

export const ITEMS = {
    BASE: `${API_RESOURCES.ITEMS}`,
    COUNT: `${API_RESOURCES.ITEMS}/count`,
    BY_ID: `${API_RESOURCES.ITEMS}/${DEFAULT_API_PATHS.BY_ID}`,
};
