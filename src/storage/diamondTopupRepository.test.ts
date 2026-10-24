import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDiamondTopupRequest, listMyDiamondTopupRequests } from './diamondTopupRepository';

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock('./supabaseClient', () => ({ supabase: { rpc } }));

const order = {
  orderId: '0e6c88c3-9764-4f46-99e7-d962f0c2ac13',
  orderNumber: 'BE-TOP-20261024-12AB34CD',
  packageId: 'starter',
  packageName: 'الباقة الأولى',
  diamonds: 100,
  amountEgp: 50,
  status: 'pending',
  createdAt: '2026-10-24T00:00:00.000Z',
  reviewedAt: null,
  reviewReason: null,
} as const;

beforeEach(() => rpc.mockReset());

describe('diamond top-up repository', () => {
  it('creates a manual top-up request with the selected package and idempotency key', async () => {
    rpc.mockResolvedValue({ data: order, error: null });

    await expect(createDiamondTopupRequest('starter', '11111111-1111-4111-8111-111111111111')).resolves.toEqual(order);
    expect(rpc).toHaveBeenCalledWith('create_diamond_topup_request', {
      p_package_id: 'starter',
      p_request_id: '11111111-1111-4111-8111-111111111111',
    });
  });

  it('returns only the active user request rows from the listing RPC', async () => {
    rpc.mockResolvedValue({ data: [order], error: null });

    await expect(listMyDiamondTopupRequests()).resolves.toEqual([order]);
    expect(rpc).toHaveBeenCalledWith('list_my_diamond_topup_requests', { p_limit: 20 });
  });

  it('maps missing authentication to an account-linking instruction', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'authentication_required' } });

    await expect(createDiamondTopupRequest('starter', '11111111-1111-4111-8111-111111111111'))
      .rejects.toThrow('اربط حسابك أولًا');
  });
});
