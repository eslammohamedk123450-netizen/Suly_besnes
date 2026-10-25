import { GitHubUser, GitHubRepo, GitHubTreeItem, GitHubCommit } from '../types';

export class GitHubService {
  private static getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
    };
    if (token && token.trim()) {
      headers['Authorization'] = `token ${token.trim()}`;
    }
    return headers;
  }

  /**
   * Verify token and fetch authenticated user
   */
  static async getAuthenticatedUser(token: string): Promise<GitHubUser> {
    const res = await fetch('https://api.github.com/user', {
      headers: this.getHeaders(token),
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('رمز الدخول غير صالح (Invalid Token). يرجى التأكد من الرمز وإعادة المحاولة.');
      }
      throw new Error(`خطأ في التحقق من الحساب (${res.status}): ${res.statusText}`);
    }

    return await res.json();
  }

  /**
   * Fetch public user info (when no token is provided)
   */
  static async getPublicUser(username: string): Promise<GitHubUser> {
    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error(`تعذر العثور على المستخدم ${username}`);
    }

    return await res.json();
  }

  /**
   * Fetch user repositories (includes private ones if token is authenticated)
   */
  static async getUserRepos(token?: string, username = 'eslammohamedk123450-netizen'): Promise<GitHubRepo[]> {
    const endpoint = token
      ? 'https://api.github.com/user/repos?per_page=100&sort=updated'
      : `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`;

    const res = await fetch(endpoint, {
      headers: this.getHeaders(token),
    });

    if (!res.ok) {
      throw new Error(`فشل جلب المستودعات (${res.status}): ${res.statusText}`);
    }

    return await res.json();
  }

  /**
   * Check accessibility of a specific repository (e.g., Suly_besnes)
   */
  static async testRepoAccess(
    owner: string,
    repoName: string,
    token?: string
  ): Promise<{ success: boolean; status: number; message: string; repo?: GitHubRepo }> {
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
        headers: this.getHeaders(token),
      });

      if (res.status === 200) {
        const repo = await res.json();
        return {
          success: true,
          status: 200,
          message: `تم الوصول إلى المستودع بنجاح! المستودع (${repo.private ? 'خاص 🔒 Private' : 'عام 🌐 Public'})`,
          repo,
        };
      } else if (res.status === 404) {
        return {
          success: false,
          status: 404,
          message: token
            ? `المستودع ${owner}/${repoName} غير موجود أو أن رمز الوصول لا يملك صلاحية القراءة لهذا المستودع الخاص.`
            : `المستودع ${owner}/${repoName} غير متاح بشكل عام (قد يكون خاصاً Private). يتطلب إدخال رمز وصول GitHub PAT للوصول إليه.`,
        };
      } else if (res.status === 401) {
        return {
          success: false,
          status: 401,
          message: 'رمز الوصول غير مصرح به (Unauthorized). يرجى التحقق من صحة الرمز.',
        };
      } else {
        return {
          success: false,
          status: res.status,
          message: `استجابة غير متوقعة من GitHub (${res.status}): ${res.statusText}`,
        };
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        status: 0,
        message: `فشل الاتصال: ${errMsg}`,
      };
    }
  }

  /**
   * Fetch repository file tree
   */
  static async getRepoTree(owner: string, repo: string, branch = 'main', token?: string): Promise<GitHubTreeItem[]> {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, {
      headers: this.getHeaders(token),
    });

    if (!res.ok) {
      // Try master branch as fallback
      if (branch === 'main') {
        const fallback = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`, {
          headers: this.getHeaders(token),
        });
        if (fallback.ok) {
          const data = await fallback.json();
          return data.tree || [];
        }
      }
      throw new Error(`تعذر جلب شجرة ملفات المستودع (${res.status})`);
    }

    const data = await res.json();
    return data.tree || [];
  }

  /**
   * Fetch file content (decoded utf-8)
   */
  static async getFileContent(owner: string, repo: string, path: string, token?: string): Promise<string> {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: this.getHeaders(token),
    });

    if (!res.ok) {
      throw new Error(`تعذر قراءة الملف ${path} (${res.status})`);
    }

    const data = await res.json();
    if (data.content && data.encoding === 'base64') {
      // Decode base64 utf-8 safely
      const binaryString = atob(data.content.replace(/\s/g, ''));
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return new TextDecoder().decode(bytes);
    }

    if (data.download_url) {
      const rawRes = await fetch(data.download_url);
      return await rawRes.text();
    }

    return '';
  }

  /**
   * Fetch recent commits
   */
  static async getRecentCommits(owner: string, repo: string, token?: string): Promise<GitHubCommit[]> {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`, {
      headers: this.getHeaders(token),
    });

    if (!res.ok) {
      return [];
    }

    return await res.json();
  }

  /**
   * Create or update a file in repository (e.g. store backup / config)
   */
  static async commitStoreFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    commitMessage: string,
    token: string,
    branch = 'main'
  ): Promise<{ success: boolean; message: string }> {
    try {
      // First check if file already exists to get SHA
      let sha: string | undefined;
      try {
        const checkRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
          headers: this.getHeaders(token),
        });
        if (checkRes.ok) {
          const fileData = await checkRes.json();
          sha = fileData.sha;
        }
      } catch {
        // file doesn't exist yet, proceed
      }

      // Encode UTF-8 content to base64
      const utf8Bytes = new TextEncoder().encode(content);
      let binary = '';
      for (let i = 0; i < utf8Bytes.byteLength; i++) {
        binary += String.fromCharCode(utf8Bytes[i]);
      }
      const b64Content = btoa(binary);

      const body: { message: string; content: string; branch: string; sha?: string } = {
        message: commitMessage,
        content: b64Content,
        branch,
      };
      if (sha) {
        body.sha = sha;
      }

      const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: {
          ...this.getHeaders(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!putRes.ok) {
        const err = await putRes.json().catch(() => ({}));
        throw new Error(err.message || putRes.statusText);
      }

      return {
        success: true,
        message: `تم رفع وتحديث الملف ${path} بنجاح في المستودع!`,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `فشل الحفظ في GitHub: ${errMsg}`,
      };
    }
  }
}
