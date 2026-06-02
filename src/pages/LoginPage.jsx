import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(form.name, form.email, form.password);
        toast.success("Conta criada! Bem-vindo ao bolão!");
      } else {
        await login(form.email, form.password);
        toast.success("Login feito! Boa sorte!");
      }
      navigate("/");
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Algo deu errado. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brutal-yellow flex items-center justify-center p-4">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #0A0A0A 0, #0A0A0A 1px, transparent 0, transparent 50%)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block bg-brutal-black text-brutal-yellow px-4 py-2 border-4 border-brutal-black shadow-brutal-yellow mb-4 rotate-[-1deg]">
            <span className="font-display text-2xl tracking-wider">
              BOLÃO
            </span>
          </div>
          <h1 className="font-display text-5xl text-brutal-black leading-tight">
            COPA DO
            <br />
            MUNDO
          </h1>
          <p className="font-body text-brutal-black font-bold mt-1 opacity-60">
            Quem vai ser campeão?
          </p>
        </div>

        <div className="bg-brutal-white border-4 border-brutal-black shadow-brutal-xl p-6">
          <div className="flex mb-6 border-4 border-brutal-black">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-3 font-display text-sm tracking-wider transition-colors ${
                !isRegister
                  ? "bg-brutal-black text-brutal-yellow"
                  : "bg-transparent text-brutal-black hover:bg-brutal-gray"
              }`}
            >
              ENTRAR
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-3 font-display text-sm tracking-wider transition-colors border-l-4 border-brutal-black ${
                isRegister
                  ? "bg-brutal-black text-brutal-yellow"
                  : "bg-transparent text-brutal-black hover:bg-brutal-gray"
              }`}
            >
              CADASTRAR
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block font-display text-xs tracking-widest mb-1 text-brutal-black">
                  SEU NOME
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ex: Ronaldo Fenômeno"
                  required
                  className="w-full border-4 border-brutal-black p-3 font-body font-bold bg-brutal-white placeholder-brutal-black/40 focus:outline-none focus:shadow-brutal transition-shadow"
                />
              </div>
            )}

            <div>
              <label className="block font-display text-xs tracking-widest mb-1 text-brutal-black">
                EMAIL
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                required
                className="w-full border-4 border-brutal-black p-3 font-body font-bold bg-brutal-white placeholder-brutal-black/40 focus:outline-none focus:shadow-brutal transition-shadow"
              />
            </div>

            <div>
              <label className="block font-display text-xs tracking-widest mb-1 text-brutal-black">
                SENHA
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 caracteres"
                required
                className="w-full border-4 border-brutal-black p-3 font-body font-bold bg-brutal-white placeholder-brutal-black/40 focus:outline-none focus:shadow-brutal transition-shadow"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brutal-black text-brutal-yellow border-4 border-brutal-black py-4 font-display text-lg tracking-wider shadow-brutal-yellow hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all active:translate-x-2 active:translate-y-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? "..."
                : isRegister
                  ? "ENTRAR NO BOLÃO"
                  : "FAZER LOGIN"}
            </button>
          </form>
        </div>

        <p className="text-center font-body text-brutal-black/60 text-sm mt-4 font-bold">
          Copão Enterprises LTDA - {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
