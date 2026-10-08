"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const API = 'http://localhost:5000';

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score, label: 'Fair', color: 'bg-yellow-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
}

export default function ModernLoginSignup({ defaultIsLogin = true }: { defaultIsLogin?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // We can determine isLogin based on the prop or the current path
  const [isLogin, setIsLogin] = useState(defaultIsLogin);

  // Sync state if path changes
  useEffect(() => {
    if (location.pathname === '/login') setIsLogin(true);
    if (location.pathname === '/signup') setIsLogin(false);
  }, [location.pathname]);

  const toggleMode = (login: boolean) => {
    setIsLogin(login);
    setForgotPasswordStep('none');
    navigate(login ? '/login' : '/signup');
  };

  // Auth States
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'none' | 'email' | 'otp' | 'reset' | 'success'>('none');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
      if (countdown > 0) {
          const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
          return () => clearTimeout(timer);
      }
  }, [countdown]);

  const handleSendOtp = async () => {
      if (!form.fullName) return setError("Please enter your full name first.");
      if (!form.email) return setError("Please enter your email first.");
      setError('');
      setLoading(true);
      try {
          const res = await fetch(`${API}/api/auth/send-otp`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: form.email }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
          setOtpSent(true);
          setCountdown(60); // 60s cooldown before resend
      } catch (err: any) {
          setError(err.message);
      } finally {
          setLoading(false);
      }
  };

  const handleVerifyOtp = async () => {
      if (!otp) return setError("Please enter the OTP.");
      setError('');
      setLoading(true);
      try {
          const res = await fetch(`${API}/api/auth/verify-otp`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: form.email, otp, mode: 'register' }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Invalid OTP');
          setOtpVerified(true);
      } catch (err: any) {
          setError(err.message);
      } finally {
          setLoading(false);
      }
  };
  const handleForgotSendOtp = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!form.email) return setError("Please enter your email.");
      setError('');
      setLoading(true);
      try {
          const res = await fetch(`${API}/api/auth/forgot-password`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: form.email }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
          setOtpSent(true);
          setCountdown(60);
          setForgotPasswordStep('otp');
      } catch (err: any) {
          setError(err.message);
      } finally {
          setLoading(false);
      }
  };

  const handleForgotVerifyOtp = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!otp) return setError("Please enter the OTP.");
      setError('');
      setLoading(true);
      try {
          const res = await fetch(`${API}/api/auth/verify-otp`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: form.email, otp, mode: 'reset' }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Invalid OTP');
          setForgotPasswordStep('reset');
      } catch (err: any) {
          setError(err.message);
      } finally {
          setLoading(false);
      }
  };

  const handleForgotResetPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (form.password.length < 6) return setError("Password must be at least 6 characters.");
      if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
      setError('');
      setLoading(true);
      try {
          const res = await fetch(`${API}/api/auth/reset-password`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: form.email, otp, new_password: form.password }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to reset password');
          setForgotPasswordStep('success');
      } catch (err: any) {
          setError(err.message);
      } finally {
          setLoading(false);
      }
  };

  const strength = getPasswordStrength(form.password);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  // Google Auth Init
  useEffect(() => {
    const initGoogle = () => {
      if (window.google && googleButtonRef.current) {
        googleButtonRef.current.innerHTML = '';
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '449734553758-pnmu0t18hv8o1suqp9fnbdakjnvhhj2j.apps.googleusercontent.com',
          callback: handleGoogleResponse,
          use_fedcm_for_prompt: false
        });
        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          { theme: 'outline', size: 'large', width: 320 }
        );
      }
    };

    if (window.google) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          initGoogle();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isLogin, forgotPasswordStep]); // Re-render button when switching modes

  const handleGoogleResponse = async (response: any) => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google authentication failed');
      localStorage.setItem('nickle_token', data.token);
      localStorage.setItem('nickle_user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('nickle_token', data.token);
      localStorage.setItem('nickle_user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otpVerified) {
        setError('Please verify your email first.');
        return;
    }
    if (form.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: form.fullName, email: form.email, password: form.password, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      localStorage.setItem('nickle_token', data.token);
      localStorage.setItem('nickle_user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Three.js Background
  useEffect(() => {
    let active = true;
    let renderer: any;
    let geometry: any;
    let material: any;
    let scene: any;
    let camera: any;
    let animationId: number;

    const initThree = (THREE: any) => {
      if (!canvasRef.current || !active) return;
      const canvas = canvasRef.current;
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);

      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      const uniforms = {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth * 2, window.innerHeight * 2) },
        u_opacities: { value: [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1.0] },
        u_colors: { value: [
          new THREE.Vector3(1, 1, 1),
          new THREE.Vector3(1, 1, 1),
          new THREE.Vector3(1, 1, 1),
          new THREE.Vector3(1, 1, 1),
          new THREE.Vector3(1, 1, 1),
          new THREE.Vector3(1, 1, 1)
        ] },
        u_total_size: { value: 20.0 },
        u_dot_size: { value: 6.0 },
        u_reverse: { value: 0 }
      };

      material = new THREE.ShaderMaterial({
        vertexShader: `
          precision mediump float;
          uniform vec2 u_resolution;
          out vec2 fragCoord;
          void main() {
            gl_Position = vec4(position, 1.0);
            fragCoord = (position.xy + 1.0) * 0.5 * u_resolution;
            fragCoord.y = u_resolution.y - fragCoord.y;
          }
        `,
        fragmentShader: `
          precision mediump float;
          in vec2 fragCoord;

          uniform float u_time;
          uniform float u_opacities[10];
          uniform vec3 u_colors[6];
          uniform float u_total_size;
          uniform float u_dot_size;
          uniform vec2 u_resolution;
          uniform int u_reverse;

          out vec4 fragColor;

          float PHI = 1.61803398874989484820459;
          float random(vec2 xy) {
              return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
          }

          void main() {
              vec2 st = fragCoord.xy;
              st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));
              st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));

              float opacity = step(0.0, st.x) * step(0.0, st.y);

              vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));

              float frequency = 5.0;
              float show_offset = random(st2);
              float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));
              opacity *= u_opacities[int(rand * 10.0)];
              opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
              opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

              vec3 color = u_colors[int(show_offset * 6.0)];

              float animation_speed_factor = 3.0;
              vec2 center_grid = u_resolution / 2.0 / u_total_size;
              float dist_from_center = distance(center_grid, st2);

              float timing_offset_intro = dist_from_center * 0.01 + (random(st2) * 0.15);

              float current_timing_offset = timing_offset_intro;
              opacity *= step(current_timing_offset, u_time * animation_speed_factor);
              opacity *= clamp((1.0 - step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);

              fragColor = vec4(color, opacity);
              fragColor.rgb *= fragColor.a;
          }
        `,
        uniforms: uniforms,
        glslVersion: THREE.GLSL3,
        blending: THREE.CustomBlending,
        blendSrc: THREE.SrcAlphaFactor,
        blendDst: THREE.OneFactor,
        transparent: true
      });

      geometry = new THREE.PlaneGeometry(2, 2);
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const startTime = performance.now();
      const animate = () => {
        if (!active) return;
        animationId = requestAnimationFrame(animate);
        uniforms.u_time.value = (performance.now() - startTime) / 1000.0;
        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        uniforms.u_resolution.value.set(window.innerWidth * 2, window.innerHeight * 2);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    };

    if ((window as any).THREE) {
      const cleanUp = initThree((window as any).THREE);
      return () => {
        active = false;
        if (cleanUp) cleanUp();
        if (animationId) cancelAnimationFrame(animationId);
        if (renderer) renderer.dispose();
        if (geometry) geometry.dispose();
        if (material) material.dispose();
      };
    } else {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      script.async = true;
      script.onload = () => {
        if ((window as any).THREE) {
          const cleanUp = initThree((window as any).THREE);
        }
      };
      document.head.appendChild(script);
    }

    return () => {
      active = false;
      if (animationId) cancelAnimationFrame(animationId);
      if (renderer) renderer.dispose();
      if (geometry) geometry.dispose();
      if (material) material.dispose();
    };
  }, []);

  /* ─── shared styles ─── */
  const input: React.CSSProperties = {
    width:"100%", padding:"0.65rem 0.85rem", borderRadius:6,
    border:"1px solid #333", background:"#000", color:"#fff",
    fontSize:"0.875rem", outline:"none",
  };

  const Logo = (
    <Link to="/" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem', textDecoration: 'none'}}>
        <img src="/logo.png" alt="nickle" style={{width: 32, height: 32, borderRadius: 8, objectFit: 'cover'}} />
        <span style={{fontWeight: 700, fontSize: '1.5rem', color: '#fff', letterSpacing: '-0.025em'}}>nickle</span>
    </Link>
  );

  const Footer = (
    <div style={{marginTop:"0.85rem",fontSize:"0.75rem",color:"#666",lineHeight:1.5,textAlign:"center"}}>
      By proceeding, you agree to creating an account<br/>subject to our{" "}
      <a href="#" style={{color:"#888"}}>Terms of Service</a> and <a href="#" style={{color:"#888"}}>Privacy Policy</a>.
    </div>
  );

  return (
    <div style={{position:"relative",width:"100%",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",background:"#000",color:"#fff",fontFamily:"'Inter',-apple-system,sans-serif"}}>
      {/* WebGL Dot canvas */}
      <canvas ref={canvasRef} style={{position:"absolute",inset:0,zIndex:0}}/>

      {/* Vignette */}
      <div style={{position:"absolute",inset:0,zIndex:1,background:"radial-gradient(circle at center,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0) 100%)",pointerEvents:"none"}}/>

      {/* Modal card */}
      <div style={{position:"relative",zIndex:2,background:"#121212",borderRadius:12,padding:"2rem",width:"100%",maxWidth:400,boxShadow:"0 10px 40px rgba(0,0,0,0.8)",display:"flex",flexDirection:"column",alignItems:"center",border:"1px solid #222"}}>
        


        {isLogin ? (
          forgotPasswordStep !== 'none' ? (
            <div style={{width:"100%",maxWidth:360,display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center"}}>
              {Logo}

              {forgotPasswordStep === 'email' && (
                <>
                  <h1 style={{fontSize:"1.35rem",fontWeight:600,marginBottom:"0.25rem",letterSpacing:"-0.025em"}}>Reset your password</h1>
                  <p style={{fontSize:"0.85rem",color:"#888",marginBottom:"0.85rem",lineHeight:1.5}}>Enter your registered email to continue.</p>
                  <form onSubmit={handleForgotSendOtp} style={{width:"100%",display:"flex",flexDirection:"column",gap:"0.65rem"}}>
                    <input style={input} type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required/>
                    {error && (
                        <div className="flex items-center gap-2 bg-red-900/20 border border-red-800/50 text-red-400 px-4 py-3 rounded-xl text-sm w-full text-left">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}
                    <button type="submit" disabled={loading} style={{width:"100%",padding:"0.65rem",borderRadius:6,border:"none",background:"#ededed",color:"#000",fontWeight:500,fontSize:"0.875rem",cursor:"pointer",opacity: loading ? 0.7 : 1}}>
                        {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                  </form>
                </>
              )}

              {forgotPasswordStep === 'otp' && (
                <>
                  <h1 style={{fontSize:"1.35rem",fontWeight:600,marginBottom:"0.25rem",letterSpacing:"-0.025em"}}>Check your email</h1>
                  <p style={{fontSize:"0.85rem",color:"#888",marginBottom:"0.85rem",lineHeight:1.5}}>Enter the 6-digit verification code.</p>
                  <form onSubmit={handleForgotVerifyOtp} style={{width:"100%",display:"flex",flexDirection:"column",gap:"0.65rem"}}>
                    <input style={{...input, textAlign: 'center', letterSpacing: '0.2em', fontSize: '1.25rem'}} type="text" placeholder="------" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required />
                    {error && (
                        <div className="flex items-center gap-2 bg-red-900/20 border border-red-800/50 text-red-400 px-4 py-3 rounded-xl text-sm w-full text-left">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}
                    <button type="submit" disabled={loading} style={{width:"100%",padding:"0.65rem",borderRadius:6,border:"none",background:"#ededed",color:"#000",fontWeight:500,fontSize:"0.875rem",cursor:"pointer",opacity: loading ? 0.7 : 1}}>
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    <button type="button" onClick={() => handleForgotSendOtp()} disabled={loading || countdown > 0} style={{color: countdown > 0 ? "#555" : "#888", background:"none", border:"none", fontSize:"0.75rem", cursor: countdown > 0 ? 'default' : 'pointer', marginTop: '0.5rem'}}>
                        {countdown > 0 ? `Resend code in ${Math.floor(countdown/60)}:${String(countdown%60).padStart(2,'0')}` : 'Didn\'t receive it? Resend'}
                    </button>
                  </form>
                </>
              )}

              {forgotPasswordStep === 'reset' && (
                <>
                  <h1 style={{fontSize:"1.35rem",fontWeight:600,marginBottom:"0.25rem",letterSpacing:"-0.025em"}}>Create a new password</h1>
                  <p style={{fontSize:"0.85rem",color:"#888",marginBottom:"0.85rem",lineHeight:1.5}}>Please enter your new password below.</p>
                  <form onSubmit={handleForgotResetPassword} style={{width:"100%",display:"flex",flexDirection:"column",gap:"0.65rem"}}>
                    <div style={{position: 'relative', width: '100%'}}>
                        <input style={{...input, paddingRight: '2.5rem'}} type={showPassword ? 'text' : 'password'} placeholder="New password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} minLength={6} required/>
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0}}>
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    <div style={{position: 'relative', width: '100%'}}>
                        <input style={{...input, paddingRight: '2.5rem'}} type={showPassword ? 'text' : 'password'} placeholder="Confirm new password" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} minLength={6} required/>
                    </div>
                    {error && (
                        <div className="flex items-center gap-2 bg-red-900/20 border border-red-800/50 text-red-400 px-4 py-3 rounded-xl text-sm w-full text-left">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}
                    <button type="submit" disabled={loading} style={{width:"100%",padding:"0.65rem",borderRadius:6,border:"none",background:"#ededed",color:"#000",fontWeight:500,fontSize:"0.875rem",cursor:"pointer",opacity: loading ? 0.7 : 1}}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </form>
                </>
              )}

              {forgotPasswordStep === 'success' && (
                <>
                  <div style={{width: '48px', height: '48px', borderRadius: '50%', background: '#22c55e20', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem'}}>
                      <CheckCircle size={24} style={{color: '#22c55e'}} />
                  </div>
                  <h1 style={{fontSize:"1.35rem",fontWeight:600,marginBottom:"0.25rem",letterSpacing:"-0.025em"}}>Password reset successfully</h1>
                  <p style={{fontSize:"0.85rem",color:"#888",marginBottom:"1.5rem",lineHeight:1.5}}>You can now sign in with your new password.</p>
                  <button type="button" onClick={() => {setForgotPasswordStep('none'); setForm({...form, password: '', confirmPassword: ''});}} style={{width:"100%",padding:"0.65rem",borderRadius:6,border:"none",background:"#ededed",color:"#000",fontWeight:500,fontSize:"0.875rem",cursor:"pointer"}}>
                      Back to Sign In
                  </button>
                </>
              )}

              {forgotPasswordStep !== 'success' && (
                <button type="button" onClick={() => {setError(''); setForgotPasswordStep('none');}} style={{color:"#888", background:"none", border:"none", fontSize:"0.875rem", cursor:"pointer", marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                    &larr; Back to Sign In
                </button>
              )}
            </div>
          ) : (
            <div style={{width:"100%",maxWidth:360,display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center"}}>
              {Logo}
            <h1 style={{fontSize:"1.35rem",fontWeight:600,marginBottom:"1.25rem",letterSpacing:"-0.025em"}}>Sign in to Account</h1>

            <form onSubmit={handleLoginSubmit} style={{width:"100%",display:"flex",flexDirection:"column",gap:"0.65rem"}}>
              <input style={input} type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required/>
              <div style={{position: 'relative', width: '100%'}}>
                  <input style={{...input, paddingRight: '2.5rem'}} type={showPassword ? 'text' : 'password'} placeholder="Your password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required/>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0}}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
              </div>

              <div style={{width: '100%', textAlign: 'right', marginTop: '-0.25rem'}}>
                <button type="button" onClick={() => { setError(''); setForgotPasswordStep('email'); }} style={{background: 'none', border: 'none', color: '#888', fontSize: '0.75rem', cursor: 'pointer', padding: 0}}>
                  Forgot password?
                </button>
              </div>
              
              {error && (
                  <div className="flex items-center gap-2 bg-red-900/20 border border-red-800/50 text-red-400 px-4 py-3 rounded-xl text-sm w-full text-left">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                  </div>
              )}

              <button type="submit" disabled={loading} style={{width:"100%",padding:"0.65rem",borderRadius:6,border:"none",background:"#ededed",color:"#000",fontWeight:500,fontSize:"0.875rem",cursor:"pointer",opacity: loading ? 0.7 : 1}}>
                  {loading ? 'Logging in...' : 'Continue with Email'}
              </button>
            </form>

            <div style={{height:1,background:"#222",width:"100%",margin:"0.85rem 0"}}/>

            {/* Google identity services button container */}
            <div style={{display: 'flex', justifyContent: 'center', width: '100%'}} ref={googleButtonRef}></div>

            <div style={{marginTop:"1.25rem",fontSize:"0.875rem",color:"#888"}}>
              Don't have an account?{" "}
              <button onClick={()=>toggleMode(false)} style={{color:"#fff",fontWeight:500,background:"none",border:"none",padding:0,cursor:"pointer",fontFamily:"inherit",fontSize:"inherit"}}>Sign Up</button>
            </div>
            {Footer}
          </div>
          )
        ) : (
          <div style={{width:"100%",maxWidth:360,display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center"}}>
            {Logo}
            <h1 style={{fontSize:"1.35rem",fontWeight:600,marginBottom:"1.25rem",letterSpacing:"-0.025em"}}>Sign up for Account</h1>

            <form onSubmit={handleSignupSubmit} style={{width:"100%",display:"flex",flexDirection:"column",gap:"0.65rem"}}>
              <input style={input} type="text" placeholder="Full Name" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required/>
              
              <div style={{position: 'relative', width: '100%'}}>
                  <input style={{...input, paddingRight: '4.5rem'}} type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} disabled={otpVerified} required/>
                  {otpVerified ? (
                      <CheckCircle size={18} style={{position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#22c55e'}} />
                  ) : (
                      <button type="button" onClick={handleSendOtp} disabled={loading || countdown > 0} style={{position: 'absolute', right: '0.35rem', top: '50%', transform: 'translateY(-50%)', background: countdown > 0 ? 'transparent' : '#333', border: 'none', color: countdown > 0 ? '#888' : '#fff', cursor: countdown > 0 ? 'default' : 'pointer', padding: '0.35rem 0.6rem', borderRadius: 4, fontSize: '0.75rem'}}>
                          {countdown > 0 ? `${Math.floor(countdown/60)}:${String(countdown%60).padStart(2,'0')}` : (otpSent ? 'Resend' : 'Verify')}
                      </button>
                  )}
              </div>

              {otpSent && !otpVerified && (
                  <div style={{display: 'flex', gap: '0.5rem', width: '100%'}}>
                      <input style={{...input, flex: 1}} type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required />
                      <button type="button" onClick={handleVerifyOtp} disabled={loading} style={{background: '#ededed', border: 'none', color: '#000', cursor: 'pointer', padding: '0 1rem', borderRadius: 6, fontSize: '0.875rem', fontWeight: 500}}>
                          Confirm
                      </button>
                  </div>
              )}
              <div style={{position: 'relative', width: '100%'}}>
                  <input style={{...input, paddingRight: '2.5rem'}} type={showPassword ? 'text' : 'password'} minLength={6} placeholder="Min. 6 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required/>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0}}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
              </div>
              
              {form.password.length > 0 && (
                  <div style={{width: '100%', marginTop: '0.25rem', textAlign: 'left'}}>
                      <div style={{display: 'flex', gap: '4px', marginBottom: '4px'}}>
                          {[1, 2, 3, 4, 5].map(i => (
                              <div key={i} style={{height: '4px', flex: 1, borderRadius: '2px', background: i <= strength.score ? (strength.score <= 1 ? '#ef4444' : strength.score <= 3 ? '#eab308' : '#22c55e') : '#333', transition: 'all 0.3s'}} />
                          ))}
                      </div>
                      <p style={{fontSize: '0.75rem', color: '#888'}}>Password strength: <span style={{fontWeight: 600, color: '#fff'}}>{strength.label}</span></p>
                  </div>
              )}

                  <div style={{display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.75rem', color: '#888', textAlign: 'left', marginTop: '0.25rem'}}>
                  <CheckCircle size={14} style={{color: '#6366f1', flexShrink: 0, marginTop: '2px'}} />
                  An OTP will be sent to your email to verify your account.
              </div>

              {error && (
                  <div className="flex items-center gap-2 bg-red-900/20 border border-red-800/50 text-red-400 px-4 py-3 rounded-xl text-sm w-full text-left">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                  </div>
              )}

              <button type="submit" disabled={loading || !otpVerified} style={{width:"100%",padding:"0.65rem",borderRadius:6,border:"none",background: otpVerified ? "#ededed" : "#333",color: otpVerified ? "#000" : "#888",fontWeight:500,fontSize:"0.875rem",cursor: otpVerified ? "pointer" : "not-allowed",opacity: loading ? 0.7 : 1}}>
                  {(loading && otpVerified) ? 'Creating account...' : 'Sign Up with Email'}
              </button>
            </form>

            <div style={{height:1,background:"#222",width:"100%",margin:"0.85rem 0"}}/>

            {/* Google identity services button container */}
            <div style={{display: 'flex', justifyContent: 'center', width: '100%'}} ref={googleButtonRef}></div>

            <div style={{marginTop:"1.25rem",fontSize:"0.875rem",color:"#888"}}>
              Already have an account?{" "}
              <button onClick={()=>toggleMode(true)} style={{color:"#fff",fontWeight:500,background:"none",border:"none",padding:0,cursor:"pointer",fontFamily:"inherit",fontSize:"inherit"}}>Sign In</button>
            </div>
            {Footer}
          </div>
        )}
      </div>
    </div>
  );
}
