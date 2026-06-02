import { Link } from 'react-router-dom';
import { Card } from '../components/ui';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-180px)] items-center justify-center px-4 py-10">
      <Card className="max-w-xl bg-brutal-yellow p-6 text-center">
        <p className="font-display text-sm tracking-widest text-brutal-black/55">ERRO 404</p>
        <h1 className="mt-2 font-display text-5xl leading-none text-brutal-black sm:text-6xl">
          Página não encontrada
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm font-bold text-brutal-black/65">
          Essa rota não existe no bolão. Volte para os jogos e siga com os palpites.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            to="/"
            className="border-4 border-brutal-black bg-brutal-black px-4 py-3 font-display text-sm tracking-wider text-brutal-yellow shadow-brutal-yellow transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            VOLTAR PARA JOGOS
          </Link>
        </div>
      </Card>
    </div>
  );
}
