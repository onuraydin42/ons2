"use client";

import Image from "next/image";

import CharGround from "@/components/CharGround";
import { Reveal } from "@/components/motion/Reveal";
import { MISSION } from "@/data/site";
import { MARK_HEIGHT, MARK_SRC, MARK_WIDTH } from "@/lib/brand";

/**
 * The brochure's opening page: the mission and the goal, in the mark's own foil on
 * burnt timber, the way the brochure's cover has it.
 */
export default function Mission() {
  const lead = "italic text-gold-light";

  return (
    <CharGround id="mission" aria-label={MISSION.mission.lead} className="overflow-hidden py-24 sm:py-32 lg:py-40 short:py-16">
      <div className="safe-gutter mx-auto grid max-w-6xl items-center gap-12 px-6 sm:px-10 lg:grid-cols-[auto_1fr] lg:gap-24 lg:px-16 short:grid-cols-[auto_1fr] short:gap-10">
        <Reveal>
          <Image
            src={MARK_SRC}
            alt=""
            width={MARK_WIDTH}
            height={MARK_HEIGHT}
            className="mx-auto h-36 w-auto sm:h-48 lg:h-72 short:h-36"
          />
        </Reveal>

        <div>
          <Reveal as="p" className="text-pretty font-display text-[clamp(1.5rem,5.6vw,2.15rem)] leading-[1.28] sm:text-[2.2rem] lg:text-[2.7rem] short:text-[1.45rem]">
            <span className={lead}>{MISSION.mission.lead}</span> {MISSION.mission.text}
          </Reveal>
          <Reveal delay={0.08}>
            <span aria-hidden className="my-8 block h-px w-16 bg-gold lg:my-10 short:my-5" />
          </Reveal>
          <Reveal as="p" delay={0.12} className="text-pretty font-display text-[clamp(1.5rem,5.6vw,2.15rem)] leading-[1.28] text-ivory/90 sm:text-[2.2rem] lg:text-[2.7rem] short:text-[1.45rem]">
            <span className={lead}>{MISSION.goal.lead}</span> {MISSION.goal.text}
          </Reveal>
        </div>
      </div>
    </CharGround>
  );
}
