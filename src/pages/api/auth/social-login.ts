import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, image, provider, providerId, role: bodyRole, idToken } = req.body;

    console.log('==================== FRONTEND SOCIAL LOGIN API ====================');
    console.log('📥 Received request body:', JSON.stringify(req.body, null, 2));
    console.log('Individual Fields Received:');
    console.log('  - Email:', email);
    console.log('  - Name:', name);
    console.log('  - Image:', image);
    console.log('  - Provider:', provider);
    console.log('  - Provider ID:', providerId);
    console.log('  - Role (from body):', bodyRole);
    console.log('  - ID Token present:', !!idToken);

    // Use the role from the request body (will be passed from NextAuth callback)
    let role = bodyRole || 'DOG_OWNER';

    // Ensure role is valid
    if (role !== 'DOG_OWNER' && role !== 'FIELD_OWNER') {
      console.log('⚠️  Invalid role detected, defaulting to DOG_OWNER. Received:', role);
      role = 'DOG_OWNER';
    }

    console.log('✅ Final role to be used:', role);
    console.log('===================================================================');

    // Validate input
    if (!email || !provider || !providerId) {
      console.log('❌ Validation failed - missing required fields:');
      console.log('  - Email present:', !!email);
      console.log('  - Provider present:', !!provider);
      console.log('  - Provider ID present:', !!providerId);
      return res.status(400).json({ error: 'Missing required fields' });
    }
    console.log('✅ Validation passed - all required fields present');

    // Prepare payload for backend
    const backendPayload = {
      email,
      name,
      image,
      provider,
      providerId,
      role,
      // Pass ID token for server-side verification (required for Google)
      idToken,
    };

    // Use INTERNAL_API_URL for server-side calls (Docker), fallback to NEXT_PUBLIC_API_URL
    const backendUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    console.log('\n📤 Sending payload to backend:');
    console.log('Backend URL:', backendUrl);
    console.log('Endpoint: /auth/social-login');
    console.log('Payload:', JSON.stringify(backendPayload, null, 2));
    const response = await fetch(`${backendUrl}/auth/social-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload),
    });

    console.log('📨 Backend response status:', response.status);
    console.log('📨 Backend response headers:', Object.fromEntries(response.headers.entries()));

    // Handle response - check if it's JSON first
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    console.log('📋 Content-Type:', contentType);
    console.log('📋 Is JSON:', isJson);

    if (!response.ok) {
      console.log('❌ Backend returned error status:', response.status);
      let error;
      if (isJson) {
        try {
          error = await response.json();
          console.log('❌ Error response (JSON):', JSON.stringify(error, null, 2));
        } catch (e) {
          console.log('❌ Failed to parse error response as JSON:', e);
          error = { error: 'Failed to parse error response' };
        }
      } else {
        // Response is not JSON (could be text like "Too many requests")
        const text = await response.text();
        console.error('❌ Non-JSON error response:', text);
        error = { error: text || 'Authentication failed' };
      }

      // For duplicate account errors, return with specific error structure and set cookie
      const errorMessage = error.message || error.error || 'Authentication failed';

      // Check for role mismatch errors
      if (errorMessage.includes('This email is already registered as a')) {
        // Set a cookie with the error message
        res.setHeader('Set-Cookie', `authErrorMessage=${encodeURIComponent(errorMessage)}; Path=/; Max-Age=60; HttpOnly=false; SameSite=Lax`);

        return res.status(409).json({
          error: 'ROLE_MISMATCH',
          message: errorMessage,
          details: errorMessage
        });
      }

      // Check for duplicate account errors (legacy)
      if (errorMessage.includes('An account already exists with this email as a')) {
        // Set a cookie with the error message
        res.setHeader('Set-Cookie', `authErrorMessage=${encodeURIComponent(errorMessage)}; Path=/; Max-Age=60; HttpOnly=false; SameSite=Lax`);

        return res.status(409).json({
          error: 'DUPLICATE_ACCOUNT',
          message: errorMessage,
          details: errorMessage
        });
      }

      return res.status(response.status).json(error);
    }

    // Parse successful response
    console.log('✅ Backend returned success status');
    let data;
    if (isJson) {
      try {
        data = await response.json();
        console.log('✅ Success response (JSON):', JSON.stringify(data, null, 2));
      } catch (e) {
        console.error('❌ Failed to parse success response:', e);
        return res.status(500).json({ error: 'Invalid response from server' });
      }
    } else {
      const text = await response.text();
      console.error('❌ Non-JSON success response:', text);
      return res.status(500).json({ error: 'Invalid response format from server' });
    }

    // Check if OTP verification is required
    if (data.requiresVerification) {
      console.log('📧 OTP verification required');
      console.log('  - Email:', data.data.email);
      console.log('  - Role:', data.data.role);
      console.log('🍪 Setting cookies for OTP verification flow');

      // Set a cookie with email and role for OTP verification
      res.setHeader('Set-Cookie', [
        `pendingEmail=${encodeURIComponent(data.data.email)}; Path=/; Max-Age=600; HttpOnly=false; SameSite=Lax`,
        `pendingRole=${encodeURIComponent(data.data.role)}; Path=/; Max-Age=600; HttpOnly=false; SameSite=Lax`,
        `socialLoginPending=true; Path=/; Max-Age=600; HttpOnly=false; SameSite=Lax`
      ]);

      console.log('✅ Returning OTP verification response to frontend');
      return res.status(200).json({
        requiresVerification: true,
        email: data.data.email,
        role: data.data.role,
        message: data.message,
      });
    }

    // Return the backend response for already verified users
    console.log('✅ User already verified - returning login response');
    console.log('  - User ID:', data.data.user?.id);
    console.log('  - User Role:', data.data.user?.role);
    console.log('==================== FRONTEND SOCIAL LOGIN COMPLETE ====================\n');
    res.status(200).json({
      user: data.data.user,
      token: data.data.token,
    });
  } catch (error) {
    console.error('❌ Social login error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.log('==================== FRONTEND SOCIAL LOGIN FAILED ====================\n');
    res.status(500).json({ error: 'Internal server error' });
  }
}