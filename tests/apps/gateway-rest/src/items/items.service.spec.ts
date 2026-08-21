import { ItemsService } from 'apps/gateway-rest/src/items/items.service';
import { of } from 'rxjs';
import { MESSAGES } from 'common/microservices/messages';

describe('ItemsService (gateway)', () => {
    it('create sends ITEMS.CREATE over TCP client', async () => {
        const send = jest.fn().mockReturnValue(of({ item: { name: 'Widget' } }));
        const service = new ItemsService({ send } as any);
        const result = await service.create({ name: 'Widget' });
        expect(send).toHaveBeenCalledWith(MESSAGES.ITEMS.CREATE, { name: 'Widget', description: undefined });
        expect(result.data.item).toEqual({ name: 'Widget' });
    });
});
