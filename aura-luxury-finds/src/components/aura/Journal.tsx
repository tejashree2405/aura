import { Reveal } from "./Reveal";
import { JOURNAL } from "@/data/journal";

const posts = JOURNAL.slice(0, 3).map((a) => ({
  tag: a.category.charAt(0).toUpperCase() + a.category.slice(1),
  title: a.title,
  img: a.cover,
  read: a.readingTime,
}));

export function Journal() {
  return (
    <section id="contact" className="py-28 md:py-40 px-6 md:px-16">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-16">
          <div>
            <Reveal><span className="eyebrow">The Beauty Journal</span></Reveal>
            <Reveal delay={1}>
              <h2 className="mt-6 font-display text-[clamp(2rem,4.5vw,3.8rem)] leading-[1.05] max-w-2xl">
                Slow reading for the <em className="italic text-[var(--earth)]">thoughtful</em>.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={2}>
            <a href="#" className="text-sm underline underline-offset-8 decoration-foreground/30 hover:decoration-foreground">All essays</a>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {posts.map((p, i) => (
            <Reveal key={p.title} delay={i}>
              <article className="group cursor-pointer">
                <div className="aspect-[5/6] overflow-hidden rounded-2xl">
                  <img
                    src={p.img}
                    alt={p.title}
                    width={800}
                    height={960}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                  />
                </div>
                <div className="pt-6">
                  <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-foreground/50">
                    <span>{p.tag}</span><span>·</span><span>{p.read} read</span>
                  </div>
                  <h3 className="mt-3 font-display text-2xl leading-snug">{p.title}</h3>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
