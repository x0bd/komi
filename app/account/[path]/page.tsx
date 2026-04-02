import { AccountView } from "@neondatabase/auth/react/ui"
import Link from "next/link"
import { LuArrowLeft, LuShield } from "react-icons/lu"
import { ensureDbUser } from "@/lib/auth/session"

type AccountPageProps = {
  params: { path: string } | Promise<{ path: string }>
}

export const dynamic = "force-dynamic"

const ACCOUNT_COPY: Record<string, { eyebrow: string; title: string; description: string }> = {
  settings: {
    eyebrow: "Control Room",
    title: "Account Settings",
    description:
      "Manage identity, security, and account preferences.",
  },
  security: {
    eyebrow: "Security",
    title: "Security Settings",
    description:
      "Control sessions, sign-in methods, and account access.",
  },
  profile: {
    eyebrow: "Profile",
    title: "Profile Settings",
    description:
      "Tune your public identity, avatar, and personal details.",
  },
}

export default async function AccountPage({ params }: AccountPageProps) {
  await ensureDbUser()

  const resolvedParams = await params
  const { path } = resolvedParams
  const content = ACCOUNT_COPY[path] ?? {
    eyebrow: "Account",
    title: "Account Workspace",
    description: "Handle the operational details of your Komi account.",
  }

  return (
    <main className="min-h-svh bg-white">
      {/* ── HERO ── */}
      <header className="bg-black border-b-[8px] border-b-swiss-red">
        <div className="mx-auto max-w-5xl px-6 lg:px-10 py-10 lg:py-16">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/40 mb-4">
            Komi / {content.eyebrow}
          </p>

          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <h1 className="font-sans text-4xl lg:text-[4rem] font-black tracking-tight text-white leading-none uppercase">
                {content.title}
              </h1>
              <p className="mt-3 text-[14px] text-white/50 max-w-md leading-relaxed font-medium">
                {content.description}
              </p>
            </div>

            {/* Nav actions */}
            <div className="flex items-center gap-3 self-end flex-wrap">
              <div className="inline-flex items-center gap-2 h-11 px-4 border-[3px] border-white/30 text-white/40 font-mono font-black uppercase tracking-widest text-[11px]">
                <LuShield className="size-4" />
                Protected
              </div>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-none border-[3px] border-white bg-transparent text-white font-mono font-black uppercase tracking-widest text-[12px] hover:bg-white hover:text-black transition-all"
              >
                <LuArrowLeft className="size-4" />
                Profile
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-none border-[3px] border-white bg-white text-black font-mono font-black uppercase tracking-widest text-[12px] hover:bg-swiss-yellow hover:border-swiss-yellow transition-all"
              >
                ← Board
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── SETTINGS SURFACE ── */}
      <div className="mx-auto max-w-5xl px-6 lg:px-10 py-10">
        {/* Section divider nav */}
        <div className="flex items-center gap-[3px] bg-black p-[3px] w-full mb-8">
          {["settings", "security", "profile"].map((tab) => (
            <Link
              key={tab}
              href={`/account/${tab}`}
              className={`flex-1 py-2.5 text-center rounded-none font-mono text-[12px] font-black uppercase tracking-widest transition-none ${
                path === tab ? "bg-white text-black" : "text-white/50 hover:text-white"
              }`}
            >
              {tab}
            </Link>
          ))}
        </div>

        {/* Account widget */}
        <div className="border-[3px] border-black bg-white shadow-[6px_6px_0_0_black] p-4 sm:p-6">
          <AccountView path={path} />
        </div>
      </div>
    </main>
  )
}
