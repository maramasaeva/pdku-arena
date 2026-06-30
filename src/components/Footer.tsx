export default function Footer() {
  return (
    <footer className="relative z-[2] text-center py-12 px-[8vw] text-white/20 text-xs tracking-widest">
      <div className="neon-divider mb-8" />
      <p>
        <span className="text-neon-cyan/50">pdku</span>
        <span className="text-neon-pink/50">:</span>
        <span className="text-neon-yellow/50">arena</span>
        {' '}&mdash;{' '}
        a <a href="https://plzdontkillus.com" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-neon-cyan transition-colors">plzdontkillus</a> experiment
      </p>
      <p className="mt-2 text-white/10">berkeley, ca &mdash; july 2026</p>
    </footer>
  )
}
