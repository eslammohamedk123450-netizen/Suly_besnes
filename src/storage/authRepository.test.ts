import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockAuth = vi.hoisted(() => ({
  getSession: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  setSession: vi.fn(),
  exchangeCodeForSession: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock('./supabaseClient', () => ({ supabase: { auth: mockAuth } }));
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => false } }));

import {
  handlePasswordRecoveryCallback,
  requestPasswordRecovery,
  updatePasswordFromRecovery,
} from './authRepository';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('account password recovery', () => {
  it('rejects a malformed email before contacting Supabase', async () => {
    const result = await requestPasswordRecovery('not-an-email');

    expect(result).toEqual({ ok: false, message: 'اكتب بريدًا إلكترونيًا صحيحًا.' });
    expect(mockAuth.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('uses a privacy-preserving response and a recovery return marker', async () => {
    mockAuth.resetPasswordForEmail.mockResolvedValue({ error: null });

    const result = await requestPasswordRecovery('  Player@Example.com  ');

    expect(mockAuth.resetPasswordForEmail).toHaveBeenCalledWith('player@example.com', {
      redirectTo: expect.stringContaining('auth=recovery'),
    });
    expect(result).toEqual({
      ok: true,
      message: 'إذا كان هذا البريد مرتبطًا بحساب، فستصلك رسالة لاستعادة كلمة المرور. تحقق من صندوق البريد والرسائل غير المرغوب فيها.',
    });
  });

  it('does not start a recovery session for unrelated links', async () => {
    const result = await handlePasswordRecoveryCallback('https://example.com/auth/recovery?type=recovery');

    expect(result).toEqual({ kind: 'ignored' });
    expect(mockAuth.setSession).not.toHaveBeenCalled();
    expect(mockAuth.exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it('restores a recovery session from native access and refresh tokens', async () => {
    mockAuth.setSession.mockResolvedValue({ error: null });

    const result = await handlePasswordRecoveryCallback(
      'com.businessempire.game://auth/recovery#access_token=access123&refresh_token=refresh456&type=recovery',
    );

    expect(mockAuth.setSession).toHaveBeenCalledWith({ access_token: 'access123', refresh_token: 'refresh456' });
    expect(result).toEqual({ kind: 'ready' });
  });

  it('exchanges a native recovery code when the callback uses PKCE', async () => {
    mockAuth.exchangeCodeForSession.mockResolvedValue({ error: null });

    const result = await handlePasswordRecoveryCallback(
      'com.businessempire.game://auth/recovery?code=single-use-code&type=recovery',
    );

    expect(mockAuth.exchangeCodeForSession).toHaveBeenCalledWith('single-use-code');
    expect(result).toEqual({ kind: 'ready' });
  });

  it('shows an expired-link message without accepting an invalid callback', async () => {
    const result = await handlePasswordRecoveryCallback(
      'com.businessempire.game://auth/recovery?error=access_denied&error_description=otp_expired',
    );

    expect(result.kind).toBe('error');
    expect(mockAuth.setSession).not.toHaveBeenCalled();
  });

  it('requires a valid session before changing the password', async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session: null }, error: null });

    const result = await updatePasswordFromRecovery('strong-pass-123');

    expect(result.ok).toBe(false);
    expect(mockAuth.updateUser).not.toHaveBeenCalled();
  });

  it('updates the password only after confirming an active session', async () => {
    mockAuth.getSession.mockResolvedValue({ data: { session: { access_token: 'valid-session' } }, error: null });
    mockAuth.updateUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'player@example.com', created_at: '2026-01-01T00:00:00.000Z' } },
      error: null,
    });

    const result = await updatePasswordFromRecovery('strong-pass-123');

    expect(mockAuth.updateUser).toHaveBeenCalledWith({ password: 'strong-pass-123' });
    expect(result).toEqual({
      ok: true,
      account: { id: 'user-1', email: 'player@example.com', createdAt: '2026-01-01T00:00:00.000Z' },
    });
  });
});
