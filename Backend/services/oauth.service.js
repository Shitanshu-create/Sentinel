import env from "../config/env.js";

/**
 * Exchange a Google authorization code for user profile data.
 */
async function exchangeGoogleCode(code) {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            code,
            client_id: env.googleClientId,
            client_secret: env.googleClientSecret,
            redirect_uri: `${env.corsOrigin}/api/auth/google/callback`,
            grant_type: "authorization_code"
        })
    });

    if (!tokenRes.ok) {
        const err = await tokenRes.text();
        throw new Error(`Google token exchange failed: ${err}`);
    }

    const { access_token } = await tokenRes.json();

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${access_token}` }
    });

    if (!profileRes.ok) {
        throw new Error("Failed to fetch Google user profile");
    }

    const profile = await profileRes.json();

    return {
        email: profile.email,
        name: profile.name || profile.email.split("@")[0],
        providerId: profile.id
    };
}

/**
 * Exchange a GitHub authorization code for user profile data.
 */
async function exchangeGithubCode(code) {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            client_id: env.githubClientId,
            client_secret: env.githubClientSecret,
            code
        })
    });

    if (!tokenRes.ok) {
        const err = await tokenRes.text();
        throw new Error(`GitHub token exchange failed: ${err}`);
    }

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
        throw new Error(`GitHub OAuth error: ${tokenData.error_description || tokenData.error}`);
    }

    const { access_token } = tokenData;

    const profileRes = await fetch("https://api.github.com/user", {
        headers: {
            Authorization: `Bearer ${access_token}`,
            "User-Agent": "Innerly-Journal-App"
        }
    });

    if (!profileRes.ok) {
        throw new Error("Failed to fetch GitHub user profile");
    }

    const profile = await profileRes.json();

    let email = profile.email;

    if (!email) {
        const emailsRes = await fetch("https://api.github.com/user/emails", {
            headers: {
                Authorization: `Bearer ${access_token}`,
                "User-Agent": "Innerly-Journal-App"
            }
        });

        if (emailsRes.ok) {
            const emails = await emailsRes.json();
            const primary = emails.find(e => e.primary && e.verified);
            email = primary?.email || emails[0]?.email || null;
        }
    }

    if (!email) {
        email = `${profile.login}@github.oauth`;
    }

    return {
        email,
        name: profile.name || profile.login,
        providerId: String(profile.id)
    };
}

export { exchangeGoogleCode, exchangeGithubCode };
