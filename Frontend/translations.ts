export const translations = {
  ko: {
    // App Header
    headerTitleShort: "타로 리딩",
    headerTitleLong: "인터랙티브 타로 리딩",
    sessionLabel: "세션:",
    joinedAsQuerent: "질문자로 참여함",

    // Lobby Screen
    lobbyWelcome: "딥인하트 타로에 오신 것을 환영합니다",
    lobbyDescription: "세션을 시작하려면 역할을 선택하세요.",
    counselorTitle: "상담사용",
    counselorDescription: "새 세션을 시작하여 질문자에게 제공할 4자리 코드를 생성하세요.",
    counselorButton: "새 세션 시작",
    querentTitle: "질문자용",
    querentDescription: "상담사에게 받은 4자리 코드를 입력하여 세션에 참여하세요.",
    querentButton: "세션 참여",
    howItWorksTitle: "사용법",
    howItWorksDescription: "카드위로 손가락을 우측에서 좌측으로 이동하면서 카드를 선택할 수 있습니다.\n핀치투줌으로 카드덱을 확대, 축소할 수 있습니다.\n빈 카드덱 위에서 손가락으로 카드 전체를 이동할 수 있습니다.",
    joiningSession: "세션에 참여하는 중...",
    
    // Setup Screen
    setupTitle: "세션 설정",
    setupDescription: "상담사님, 리딩 세션을 설정해 주세요.",
    waitingForSessionSetupTitle: "세션 준비 중",
    waitingForSessionSetupDescription: "상담사가 리딩을 준비하는 동안 잠시 기다려 주세요.",
    deckStyleLabel: "1. 덱 스타일 선택",
    cardSetLabel: "2. 카드 세트 선택",
    majorArcana: "22 메이저 아르카나",
    fullDeck: "78 전체 덱",
    reversalsLabel: "역방향 카드를 포함할까요?",
    reversalsYes: "예, 역방향 포함",
    reversalsNo: "아니요, 정방향만",
    spreadLabel: "3. 스프레드 선택",
    customSpreadLabel: "커스텀 스프레드 카드 수",
    customSpreadMaxNotice: (max: number) => `최대 ${max}장`,
    customCountMaxExceededMajor: "22 메이저 아르카나를 선택한 경우 카드 수는 22장을 넘을 수 없습니다.",
    customCountMaxExceededFull: "78 전체 덱을 선택한 경우 카드 수는 78장을 넘을 수 없습니다.",
    customCountMinNotice: "카드 수는 최소 1장 이상이어야 합니다.",
    startButton: "세션 시작",
    cardsUnit: "장",
    userDefined: "사용자 정의",

    // Shuffle Screen
    shufflingTitle: "덱을 섞는 중...",
    shuffleCompleteTitle: "섞기 완료!",
    stopShuffleButton: "섞기 중지",
    waitingForCounselorShuffle: "상담사가 섞기를 멈추기를 기다리는 중...",

    // Selection Screen
    selectCardsPrompt: (count: number) => `${count}장의 카드를 선택하세요`,
    waitingForQuerent: "질문자를 기다리는 중...",
    selectedCount: (selected: number, total: number) => `선택됨: ${selected} / ${total}.`,
    zoomInstruction: "확대/축소하려면 핀치 또는 스크롤하세요.",
    selectedCardsAppearHere: "선택한 카드가 여기에 표시됩니다",
    selectOneMoreCard: "카드 1장을 더 선택하세요",

    // Reading Screen
    counselorInControl: "당신이 제어하고 있습니다.",
    counselorIsReading: "상담사가 리딩 중입니다.",
    addCardButton: "카드 추가",
    flipAllButton: "모두 뒤집기",
    resetButton: "초기화",
    unplacedCardsTitle: "놓이지 않은 카드 (클릭하여 보드에 놓기)",
  },
  en: {
    // App Header
    headerTitleShort: "Tarot Reading",
    headerTitleLong: "Interactive Tarot Reading",
    sessionLabel: "Session:",
    joinedAsQuerent: "Joined as Querent",

    // Lobby Screen
    lobbyWelcome: "Welcome to Deepinheart Tarot",
    lobbyDescription: "Choose your role to begin the session.",
    counselorTitle: "For Counselors",
    counselorDescription: "Start a new session to generate a unique 4-digit code for your querent.",
    counselorButton: "Start New Session",
    querentTitle: "For Querents",
    querentDescription: "Enter the 4-digit code provided by your counselor to join the session.",
    querentButton: "Join Session",
    howItWorksTitle: "How to Use",
    howItWorksDescription: "You can select cards by sliding your finger from right to left over them.\nYou can zoom in and out of the deck using the pinch-to-zoom feature.\nYou can move the entire card with your finger over an empty deck.",
    joiningSession: "Joining session...",

    // Setup Screen
    setupTitle: "Session Setup",
    setupDescription: "Counselor, please configure the reading session.",
    waitingForSessionSetupTitle: "Preparing the Session",
    waitingForSessionSetupDescription: "Please wait while the counselor sets up the reading.",
    deckStyleLabel: "1. Choose Your Deck Style",
    cardSetLabel: "2. Choose Card Set",
    majorArcana: "22 Major Arcana",
    fullDeck: "78 Full Deck",
    reversalsLabel: "Include Reversed Cards?",
    reversalsYes: "Yes, include reversals",
    reversalsNo: "No, only upright",
    spreadLabel: "3. Choose Your Spread",
    customSpreadLabel: "Custom Spread Card Count",
    customSpreadMaxNotice: (max: number) => `Max ${max} cards`,
    customCountMaxExceededMajor: "When selecting 22 Major Arcana, the card count cannot exceed 22.",
    customCountMaxExceededFull: "When selecting 78 Full Deck, the card count cannot exceed 78.",
    customCountMinNotice: "Card count must be at least 1.",
    startButton: "Start Session",
    cardsUnit: "cards",
    userDefined: "User defined",

    // Shuffle Screen
    shufflingTitle: "Shuffling the Deck...",
    shuffleCompleteTitle: "Shuffle Complete!",
    stopShuffleButton: "Stop Shuffling",
    waitingForCounselorShuffle: "Waiting for the counselor to stop shuffling...",

    // Selection Screen
    selectCardsPrompt: (count: number) => `Select ${count} Card(s)`,
    waitingForQuerent: "Waiting for Querent...",
    selectedCount: (selected: number, total: number) => `Selected: ${selected} / ${total}.`,
    zoomInstruction: "Pinch or scroll to zoom.",
    selectedCardsAppearHere: "Your selected cards appear here",
    selectOneMoreCard: "Select 1 more card",

    // Reading Screen
    counselorInControl: "You are in control.",
    counselorIsReading: "The counselor is reading.",
    addCardButton: "Add Card",
    flipAllButton: "Flip All",
    resetButton: "Reset",
    unplacedCardsTitle: "Unplaced Cards (Click to place on board)",
  }
};
