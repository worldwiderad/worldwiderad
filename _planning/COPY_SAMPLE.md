# Copy sample: two sections from lower on the homepage

A sample of the voice for the deeper sections, so you can judge the long prose as well as the first screen. It uses only facts from the brief and the essays. Pilot numbers are not included.

---

## Modelling the Other

I first asked the question in June 2026. When a frontier language model predicts how a named peer model will behave, does it use evidence about that peer, or a prior tied to the peer's identity, such as whether it was developed in the US or in China? The behaviour I measure is what I call fact-laundering: whether a model asserts a serious negative claim about a named person as fact.

The study has two builds. Build 1 measures what models actually do. Sixteen subject models answer the same cases, and two judge models label every response independently. Build 2 shows predictor models a varying number of real responses from a peer, together with an identity label, and asks them to predict how the peer behaves on a case they have not seen.

Before any money goes into the confirmatory run, the design goes through rounds of blind adversarial review. Fleets of up to 21 independent model instances look for flaws, and I check each claimed flaw by simulation. The rounds continue until one finds nothing that would change what is collected or claimed. Then the study is pre-registered.

I built the pipeline myself: a collection harness for several model providers with spend limits, the dual-judge labelling, the prediction runner and the analysis code.

The design is under review now. Pre-registration comes next, and I plan to submit to TMLR in December 2026 or January 2027. Longer term I want this to become a line of research joining folk psychology and machine learning.

---

## Determinism and sentencing

*If legislators and judges all accepted the philosophical theory of determinism, what would be the effect on criminal sentencing?* John Locke Institute, law category. [Essay, PDF]

My answer turns on desert. It is the one sentencing principle that measures punishment against the moral gravity of the completed offence. Because it fixes that measure, it also limits what the state may impose, however useful a harsher sentence would be. If judges accepted determinism in the sense that denies ultimate sourcehood, both the measure and the limit would go. In the essay's words: "A court that accepts determinism can still decide who to sentence. It can no longer say by how much."

Liability survives on Morse's rational-capacity account, so the break comes at sentencing: "Capacity is a threshold concept; desert is a calibration concept." Pereboom's quarantine model and Caruso's public-health model give a ceiling through least infringement, but no way to size a sentence under it. Strawson's reactive attitudes keep importing desert into sentencing by human judges, and those same attitudes are the defendant's last rough protection. The essay tests this against the US Sentencing Commission grid, State v. Loomis and the COMPAS risk tool, and Chouldechova and Kleinberg's results on fair risk prediction. It also uses a pair of defendants with identical risk and different moral gravity, whom forward-looking sentencing cannot tell apart.

It ends in a trilemma. Keep human judges and accept that desert leaks back in; hand sentencing to algorithms and lose the human reluctance that restrained it; or let the state coerce people on grounds it has declared empty. The system would live in all three.

Before writing, I had sixteen AI reviewers from five model families attack the plan independently, and I treated the points where they agreed as the real weaknesses. The result is announced on 3 October 2026.

---

Notes on the choices:

- **The two quotations.** Both are the essay's own lines and neither uses a contrastive or three-part shape. "A ceiling is a constraint, not a metric" was the obvious third, and I left it out for that reason.
- **The trilemma.** It lists three options because the essay's trilemma has three horns. That is its content, not a rhythm.
- **Italics.** They mark only the essay prompt, as on the essay's own cover. Status is plain prose. In round 0 of the review, set-apart status lines under every entry were the strongest tell.
