// Training page content: program formats and the goalie drill library.
// Program price and duration are left empty on purpose. Fill them in only with details Nolan confirms.

export type Program = {
  id: string
  name: string
  summary: string
  whatHappens: string[]
  price?: string
  duration?: string
}

export const programs: Program[] = [
  {
    id: 'private',
    name: 'Private lessons',
    summary: 'One goalie and one coach on the ice, with the session built around that goalie.',
    whatHappens: [
      'Skating and movement work matched to the goalie’s current level',
      'Repetition on specific saves, recoveries and post play',
      'Feedback after each drill so changes can be made right away',
    ],
    price: '',
    duration: '',
  },
  {
    id: 'small-group',
    name: 'Small-group sessions',
    summary: 'A few goalies train together, rotating through drills and shooting stations.',
    whatHappens: [
      'Goalies take turns in the net while others work on movement',
      'Game-like drills with shooters, passes and rebounds',
      'Goalies see each other’s reps and compare technique',
    ],
    price: '',
    duration: '',
  },
  {
    id: 'video',
    name: 'Video review',
    summary: 'Game or practice footage is reviewed together to study positioning and decisions.',
    whatHappens: [
      'Goals against and key saves are reviewed clip by clip',
      'Depth, angle, rebound control and recovery habits are noted',
      'Each review ends with a short list of things to practice',
    ],
    price: '',
    duration: '',
  },
  {
    id: 'off-ice',
    name: 'Off-ice training',
    summary: 'Work away from the rink on hand-eye skills, mobility and goalie-specific movement.',
    whatHappens: [
      'Tennis ball and reaction ball work for hand-eye coordination',
      'Hip, groin and ankle mobility for the butterfly',
      'Footwork and balance patterns that carry over to the ice',
    ],
    price: '',
    duration: '',
  },
]

export const drillCategories = [
  'Skating & movement',
  'Positioning & angles',
  'Saves & rebound control',
  'Tracking & vision',
  'Post play',
  'Puck handling',
  'Off-ice',
] as const

export type DrillCategory = (typeof drillCategories)[number]

export const drillLevels = ['Beginner', 'Intermediate', 'Advanced'] as const
export type DrillLevel = (typeof drillLevels)[number]

export type Drill = {
  id: string
  name: string
  category: DrillCategory
  level: DrillLevel
  equipment: string[]
  description: string
  steps: string[]
  coachingPoints: string[]
  suggestedMinutes: number
}

export const drills: Drill[] = [
  {
    id: 't-push',
    name: 'T-push lines',
    category: 'Skating & movement',
    level: 'Beginner',
    equipment: ['Full goalie gear', 'Open ice or crease'],
    description: 'Lateral pushes across the ice using the T-push, the main way goalies move side to side over longer distances.',
    steps: [
      'Start in your stance on the goal line or a painted line, facing up ice.',
      'Rotate your head and lead skate toward the direction of travel.',
      'Push off the inside edge of the back skate and glide on the lead skate.',
      'Stop with the inside edge of the lead skate and square back up to the original direction.',
      'Repeat across the ice, then come back the other way.',
    ],
    coachingPoints: [
      'Lead with your eyes and head, then the skate.',
      'Keep your chest and hands up and facing the shooter while you push.',
      'Stop square and balanced, ready to make a save.',
    ],
    suggestedMinutes: 6,
  },
  {
    id: 'c-cuts',
    name: 'C-cuts forward and back',
    category: 'Skating & movement',
    level: 'Beginner',
    equipment: ['Full goalie gear', 'Open ice'],
    description: 'Alternating half-circle pushes to move forward and backward while staying square, used for depth changes.',
    steps: [
      'Start in your stance at the top of the crease.',
      'Turn one toe out and push a half circle with the inside edge, moving backward.',
      'Bring the skate back under you, then repeat with the other skate.',
      'Travel back to the goal line, then reverse the motion to move forward.',
    ],
    coachingPoints: [
      'Stay in your stance with knees bent the whole time.',
      'Keep shoulders square to the far end; the cut comes from the legs.',
      'Make short, controlled pushes rather than big wide ones.',
    ],
    suggestedMinutes: 5,
  },
  {
    id: 'shuffle',
    name: 'Shuffle ladder',
    category: 'Skating & movement',
    level: 'Beginner',
    equipment: ['Full goalie gear', 'Crease'],
    description: 'Short lateral shuffles for small adjustments while staying square to the puck.',
    steps: [
      'Set up in your stance at the top of the crease, square to the slot.',
      'Shuffle two or three short steps to one side and stop.',
      'Shuffle back past center to the other side and stop.',
      'Have a partner or coach point to a spot and shuffle to stay square to it.',
    ],
    coachingPoints: [
      'Keep the skates from crossing or coming together.',
      'Stay low with your weight on the balls of your feet.',
      'Stop with control so you are set before the shot.',
    ],
    suggestedMinutes: 5,
  },
  {
    id: 'butterfly-slide',
    name: 'Butterfly slides',
    category: 'Skating & movement',
    level: 'Intermediate',
    equipment: ['Full goalie gear', 'Crease'],
    description: 'Sliding laterally on the pads in the butterfly to cover a cross-crease pass when there is no time to get up.',
    steps: [
      'Drop into your butterfly at the center of the crease.',
      'Turn your head and lead pad toward the post you are moving to.',
      'Push off the inside edge of the back skate and slide on the pads.',
      'Stop square at the post with the lead pad sealed to the ice.',
      'Recover to your feet and repeat to the other side.',
    ],
    coachingPoints: [
      'Lead with the head and eyes so the body follows.',
      'Keep the lead pad flush to the ice so nothing slides under it.',
      'Hands stay forward; do not drop them during the slide.',
    ],
    suggestedMinutes: 6,
  },
  {
    id: 'butterfly-recovery',
    name: 'Butterfly recovery',
    category: 'Skating & movement',
    level: 'Beginner',
    equipment: ['Full goalie gear', 'Crease'],
    description: 'Getting back to your feet from the butterfly quickly, using the leg on the side you need to move toward.',
    steps: [
      'Drop into the butterfly at the top of the crease.',
      'Bring one skate up under your body with the blade on the ice.',
      'Push up onto your feet and return to your stance.',
      'Have a coach point left or right and recover with the leg on that side, then push to that spot.',
    ],
    coachingPoints: [
      'Recover with the leg closest to where you need to go next.',
      'Keep your eyes on the puck or the coach the whole time.',
      'Stay compact and avoid putting a hand down on the ice.',
    ],
    suggestedMinutes: 5,
  },
  {
    id: 'angle-arc',
    name: 'Arc positioning',
    category: 'Positioning & angles',
    level: 'Beginner',
    equipment: ['Full goalie gear', 'Pucks or cones set in an arc'],
    description: 'Moving along an imaginary arc in front of the net to stay square to pucks placed at different angles.',
    steps: [
      'Place five pucks or cones in an arc from the left faceoff dot to the right faceoff dot.',
      'Start square to the far-left puck at your normal depth.',
      'Move to square up to the next puck, using shuffles or a T-push.',
      'Check your position by looking back at the posts, then move to the next one.',
      'Work back across the arc in the other direction.',
    ],
    coachingPoints: [
      'Your nose, chest and the middle of your pads point at the puck.',
      'Hold the same depth across the arc unless the drill asks for a change.',
      'Use the posts and crease markings as reference points.',
    ],
    suggestedMinutes: 6,
  },
  {
    id: 'depth-control',
    name: 'Depth control with a shooter',
    category: 'Positioning & angles',
    level: 'Intermediate',
    equipment: ['Full goalie gear', 'Shooter', 'Pucks'],
    description: 'Adjusting how far out of the net you play as a shooter skates in, so you cut down the angle without getting beaten wide.',
    steps: [
      'A shooter starts at the blue line with a puck and skates in slowly.',
      'Start at the top of the crease and use C-cuts to back in as the shooter approaches.',
      'Match the shooter’s speed so you stay square and at a controlled depth.',
      'The shooter shoots from the slot or tries to move wide; react and make the save.',
    ],
    coachingPoints: [
      'Back in at the speed of the shooter, not faster.',
      'Stay square the whole way in.',
      'Keep enough room to push laterally if the shooter cuts across.',
    ],
    suggestedMinutes: 8,
  },
  {
    id: 'rebound-corners',
    name: 'Rebound control to the corners',
    category: 'Saves & rebound control',
    level: 'Intermediate',
    equipment: ['Full goalie gear', 'Shooter', 'Pucks', 'Cones in each corner'],
    description: 'Directing low shots with the pads and stick toward the corners instead of back into the slot.',
    steps: [
      'Place a cone in each corner as a target.',
      'A shooter takes low shots from the slot, aimed at the pads.',
      'Angle the pads and stick so the puck deflects toward a corner cone.',
      'Recover and get set for the next shot.',
    ],
    coachingPoints: [
      'Angle the pad slightly so the puck kicks toward the corner.',
      'Keep the stick at an angle on the ice, one blade-width in front of the pads.',
      'Avoid kicking the puck back out into the middle of the ice.',
    ],
    suggestedMinutes: 8,
  },
  {
    id: 'blocker-glove',
    name: 'Glove and blocker saves',
    category: 'Saves & rebound control',
    level: 'Beginner',
    equipment: ['Full goalie gear', 'Shooter', 'Pucks'],
    description: 'Controlled shots to the glove and blocker to build clean catching and blocker deflections.',
    steps: [
      'A shooter takes medium-speed shots from the slot, alternating glove and blocker sides.',
      'On glove shots, catch the puck in front of the body and hold it.',
      'On blocker shots, turn the blocker so the puck goes into the corner.',
      'Increase shot speed once the reps are clean.',
    ],
    coachingPoints: [
      'Move the hand to the puck; avoid swinging the whole body.',
      'Catch in front of you, not beside or behind you.',
      'Angle the blocker face toward the corner.',
    ],
    suggestedMinutes: 6,
  },
  {
    id: 'rebound-second-save',
    name: 'Shot and rebound second save',
    category: 'Saves & rebound control',
    level: 'Advanced',
    equipment: ['Full goalie gear', 'Two shooters', 'Pucks'],
    description: 'A first shot followed by a quick second shot from a different spot, to practice recovering and staying square.',
    steps: [
      'One shooter is in the slot and a second shooter waits at the side of the net.',
      'The first shooter takes a low shot.',
      'Right after the save, the second shooter takes a shot or a pass across.',
      'Recover or slide to square up to the second puck and make the save.',
    ],
    coachingPoints: [
      'Find the second puck with your eyes before you move.',
      'Choose recovery or a butterfly slide based on how much time you have.',
      'Stay compact; avoid lunging at the second shot.',
    ],
    suggestedMinutes: 10,
  },
  {
    id: 'screen-tracking',
    name: 'Screen tracking',
    category: 'Tracking & vision',
    level: 'Advanced',
    equipment: ['Full goalie gear', 'Shooter', 'Player as screen', 'Pucks'],
    description: 'Finding the puck around a player standing in front of the net and making the save.',
    steps: [
      'A player stands in front of the crease as a screen.',
      'A shooter moves the puck along the blue line.',
      'Look around the screen on the side the puck is on, using a low or high look.',
      'The shooter shoots; make the save and control the rebound.',
    ],
    coachingPoints: [
      'Look around the screen; avoid trying to look through it.',
      'Keep your feet set while your head moves to find the puck.',
      'If you lose the puck, take away the middle of the net.',
    ],
    suggestedMinutes: 8,
  },
  {
    id: 'puck-tracking-passes',
    name: 'Pass tracking',
    category: 'Tracking & vision',
    level: 'Intermediate',
    equipment: ['Full goalie gear', 'Two or three passers', 'Pucks'],
    description: 'Following the puck with your eyes and head as it is passed around the zone, then setting for the shot.',
    steps: [
      'Two or three players spread out across the zone.',
      'They pass the puck between them while you move to stay square to it.',
      'Turn your head to follow each pass all the way to the receiver’s stick.',
      'On a call from the coach, the receiver shoots.',
    ],
    coachingPoints: [
      'Track the puck onto the stick before you move.',
      'Turn your head with the puck so your eyes stay level.',
      'Be set before the shooter releases the puck.',
    ],
    suggestedMinutes: 8,
  },
  {
    id: 'rvh-post',
    name: 'RVH post integration',
    category: 'Post play',
    level: 'Intermediate',
    equipment: ['Full goalie gear', 'Pucks'],
    description: 'Using the reverse-VH position to seal the post on plays from below the goal line.',
    steps: [
      'Start on your feet at the post with the puck placed in the corner.',
      'Drop the post-side pad flat on the ice with the toe against the post.',
      'Keep the back leg on its skate edge, ready to push off.',
      'Have a coach move the puck below the goal line, holding the seal as it moves.',
      'Push out of the RVH to the top of the crease when the puck comes out front.',
    ],
    coachingPoints: [
      'Seal the post with the pad so there is no gap at the ice.',
      'Keep the shoulder tight to the post to cover the short side high.',
      'Use RVH for plays from sharp angles; for wider angles, stay on your feet.',
    ],
    suggestedMinutes: 6,
  },
  {
    id: 'post-to-post',
    name: 'Post-to-post',
    category: 'Post play',
    level: 'Intermediate',
    equipment: ['Full goalie gear', 'Pucks or a passer behind the net'],
    description: 'Moving from one post to the other as the puck goes behind the net or across the crease.',
    steps: [
      'Start sealed on one post, on your feet or in RVH.',
      'A coach or passer moves the puck behind the net to the other side.',
      'Push across with a T-push or a butterfly slide to the far post.',
      'Seal the far post and turn your head to find the puck.',
    ],
    coachingPoints: [
      'Push off the post with the near skate for a strong first push.',
      'Look at where you are going before you push.',
      'Arrive set and sealed, not drifting past the post.',
    ],
    suggestedMinutes: 6,
  },
  {
    id: 'stop-behind-net',
    name: 'Puck stops behind the net',
    category: 'Puck handling',
    level: 'Intermediate',
    equipment: ['Full goalie gear', 'Pucks', 'Shooter or coach at the blue line'],
    description: 'Leaving the crease to stop pucks dumped around the boards and leave them for a defender.',
    steps: [
      'A coach rims or dumps a puck around the boards from the blue line or neutral zone.',
      'Read where the puck is going and skate to the boards behind the net.',
      'Stop the puck with your stick and leave it in a spot a defender can reach.',
      'Skate back to the crease and set up for the next one.',
    ],
    coachingPoints: [
      'Read the puck early and decide quickly whether to go.',
      'Keep your stick on the ice and your body between the puck and the boards.',
      'Get back to the net fast with your eyes up the ice.',
    ],
    suggestedMinutes: 6,
  },
  {
    id: 'rims-passes',
    name: 'Rims and passes',
    category: 'Puck handling',
    level: 'Advanced',
    equipment: ['Full goalie gear', 'Pucks', 'Teammates as receivers'],
    description: 'Playing the puck to a teammate with a forehand pass or a rim along the boards.',
    steps: [
      'Start in the crease with pucks placed near the corners or behind the net.',
      'Skate to a puck and set your hands on the stick for a pass.',
      'Make a forehand pass to a defender, or rim the puck up the boards to a winger.',
      'Return to the crease and set up.',
      'Switch sides so you practice both directions.',
    ],
    coachingPoints: [
      'Look at the target before you play the puck.',
      'Keep the pass flat and at a speed the receiver can handle.',
      'Avoid passing through the middle of the ice in front of your own net.',
    ],
    suggestedMinutes: 8,
  },
  {
    id: 'tennis-juggling',
    name: 'Tennis ball juggling',
    category: 'Off-ice',
    level: 'Beginner',
    equipment: ['Two or three tennis balls'],
    description: 'Juggling and wall tosses to build hand-eye coordination and tracking.',
    steps: [
      'Stand an arm’s length from a wall with one tennis ball.',
      'Toss it against the wall and catch it with the same hand, then switch hands.',
      'Toss with one hand and catch with the other.',
      'Add a second ball and alternate throws once one ball is easy.',
    ],
    coachingPoints: [
      'Watch the ball all the way into your hand.',
      'Stay in a slight athletic stance with knees bent.',
      'Start slow and add speed once you are catching cleanly.',
    ],
    suggestedMinutes: 10,
  },
  {
    id: 'reaction-ball',
    name: 'Reaction ball',
    category: 'Off-ice',
    level: 'Intermediate',
    equipment: ['Reaction ball (six-sided bouncing ball)', 'Wall or partner'],
    description: 'A six-sided ball that bounces in unpredictable directions, used to train reaction time.',
    steps: [
      'Stand in your goalie stance a few feet from a wall.',
      'Throw the reaction ball so it bounces once on the floor before the wall.',
      'React to the bounce and catch the ball with one hand.',
      'Have a partner throw it for you to make the bounces harder to predict.',
    ],
    coachingPoints: [
      'Stay in your stance and react with your hands first.',
      'Keep your eyes on the ball, not on where you think it will go.',
      'Rest between sets so you stay sharp.',
    ],
    suggestedMinutes: 8,
  },
  {
    id: 'hip-mobility',
    name: 'Hip mobility circuit',
    category: 'Off-ice',
    level: 'Beginner',
    equipment: ['Floor mat'],
    description: 'Mobility work for the hips and groin to support a comfortable butterfly.',
    steps: [
      'Do 90/90 hip switches on the floor, rotating the knees side to side.',
      'Hold a deep goblet-style squat for a slow count of 30.',
      'Do slow adductor rock-backs on hands and knees with one leg out to the side.',
      'Finish with controlled hip circles on hands and knees.',
    ],
    coachingPoints: [
      'Move slowly and stay in a range that feels comfortable.',
      'Stop if anything causes sharp pain.',
      'Do this circuit after a light warm-up, not cold.',
    ],
    suggestedMinutes: 10,
  },
  {
    id: 'lateral-bounds',
    name: 'Lateral bounds',
    category: 'Off-ice',
    level: 'Intermediate',
    equipment: ['Open floor space', 'Optional: low cones'],
    description: 'Side-to-side single-leg jumps that build the push power used in T-pushes and slides.',
    steps: [
      'Stand on your right leg in a half squat.',
      'Push off to the side and land on your left leg.',
      'Hold the landing for one second, then bound back.',
      'Do 3 sets of 8 to 10 bounds each way with rest between.',
    ],
    coachingPoints: [
      'Land softly with the knee lined up over the toes.',
      'Hold each landing before the next bound.',
      'Increase the distance only when landings are steady.',
    ],
    suggestedMinutes: 6,
  },
]
