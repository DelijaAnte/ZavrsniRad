const hr = {
  translation: {
    common: {
      loading: "Učitavanje…",
      saving: "Spremanje…",
      cancel: "Odustani",
      delete: "Obriši",
      error: "Greška",
      cannotOpenLink: "Ne mogu otvoriti poveznicu",
      couldNotSignOut: "Odjava nije uspjela",
    },
    tabs: {
      plan: "Plan",
      train: "Trening",
      analyze: "Analiza",
      profile: "Profil",
    },
    language: {
      en: "Engleski",
      hr: "Hrvatski",
    },
    days: {
      short: {
        mon: "Pon",
        tue: "Uto",
        wed: "Sri",
        thu: "Čet",
        fri: "Pet",
        sat: "Sub",
        sun: "Ned",
      },
    },
    auth: {
      needAccountPrefix: "Treba vam račun? ",
      signUp: "Registriraj se",
      alreadyHaveAccountPrefix: "Imate račun? ",
      signIn: "Prijavite se",
      emailPlaceholder: "E-mail",
      passwordPlaceholder: "Lozinka",
      enterEmailAndPassword: "Unesite e-mail i lozinku.",
      checkEmailAndSignIn:
        "Provjerite e-mail kako biste potvrdili račun, a zatim se prijavite.",
      somethingWentWrong: "Nešto je pošlo po krivu. Pokušajte ponovno.",
      couldNotRestoreSession: "Nije moguće vratiti sesiju",
    },
    profile: {
      title: "Profil",
      language: "Jezik",
      emailLabel: "E-mail",
      notSignedIn: "Niste prijavljeni",
      sourceCode: "Izvorni kod",
      viewOnGitHub: "Pogledaj na GitHubu",
      viewSourceCodeAccessibilityLabel: "Pogledaj izvorni kod na GitHubu",
      signOut: "Odjava",
      deleteAccount: "Obriši račun",
      deleteAccountTitle: "Obriši račun",
      deleteAccountMessage:
        "Ovo trajno uklanja vaš račun i podatke o treniranju. Ova radnja se ne može poništiti.",
      cannotOpenGitHubMessage:
        "Ovaj uređaj ne može otvoriti poveznicu do projekta.",
      cannotOpenGitHubBrowserMessage:
        "Dogodila se pogreška pri otvaranju preglednika.",
    },
    plan: {
      title: "Plan",
      createRoutineAccessibilityLabel: "Kreiraj rutinu",
      couldNotSyncData: "Nije moguće sinkronizirati podatke",
      loadingPlans: "Učitavam vaše planove…",
      saving: "Spremanje…",
      noRoutinesYet: "Nema rutina još",
      tapPlusToCreateFirstRoutine:
        "Dodirnite + gumb da kreirate svoju prvu rutinu.",
      deleteRoutineTitle: "Obriši rutinu",
      deleteRoutineMessage:
        'Ukloni "{{name}}"? Povijest treninga za ovu rutinu također će biti uklonjena.',
    },
    train: {
      title: "Trening",
      exercisesSubtitle: "Vježbe",
      noExercisesForDay: "Nema vježbi za {{day}}",
      saveSessionAccessibilityLabel: "Spremi trening",
      saveSession: "Spremi trening",
      couldNotSave: "Nije moguće spremiti",
      savedTitle: "Spremljeno",
      savedMessage: "Ova sesija je spremljena na vaš račun.",
      setColumns: {
        kg: "kg",
        reps: "Ponavljanja",
        rpe: "RPE",
      },
      lastSessionLabel: "Zadnja sesija:",
      addFirstSetHint: "Dodajte svoju prvu seriju.",
      addSetButton: "+ Serija",
    },
    analyze: {
      title: "Analiza",
      loadingHistory: "Učitavam povijest…",
      progressionSubtitle: "Napredak",
      viewLabel: "Prikaz",
      selectRoutineForActivity:
        "Odaberite rutinu iznad kako biste vidjeli aktivnost za taj program.",
      activity: {
        dataSubtitle: "Dani kada ste zabilježili trening za ovu rutinu.",
        emptyHint:
          "Još nema spremljenih treninga za ovu rutinu. Zabilježite sesiju na kartici Trening.",
      },
      selectRoutineForPr:
        "Odaberite rutinu iznad kako biste vidjeli osobne rekorde.",
      noExercisesInRoutine: "Nema vježbi u ovoj rutini.",
      selectRoutineAndDayToViewProgression:
        "Odaberite rutinu i dan iznad kako biste vidjeli napredak vježbi.",
      noExercisesForDay: "Nema vježbi za {{day}}",
      noSavedSessionsForRoutineAndDay:
        "Nema spremljenih sesija za ovu rutinu i dan.",
      prList: {
        noLoggedSets: "Nema zabilježenih serija za ovu vježbu u ovoj rutini.",
      },
      views: {
        topSet: "Top set",
        trend: "Trend",
        allSets: "Sve serije",
        pr: "PR",
        activity: "Aktivnost",
      },
      heatmap: {
        title: "Aktivnost",
        month: "Mjesec",
      },
      charts: {
        weightCaption: "Težina (kg) — top set",
        noWeightValues: "Nema vrijednosti težine za graf.",
        repsCaption: "Ponavljanja — top set",
        noRepValues: "Nema vrijednosti ponavljanja za graf.",
      },
      card: {
        unitHintAllSets: "Svaka zabilježena serija po treningu",
        unitHintTopSet:
          "Top set (prva serija) po spremljenoj sesiji za ovaj dan",
        date: "Datum",
        kg: "kg",
        reps: "pon.",
        rpe: "RPE",
        set: "Serija",
        previousLatest: "Prethodno → zadnje",
        weightKgLabel: "Težina (kg)",
        repsTopSetLabel: "Ponavljanja (top set)",
        rpeTopSetLabel: "RPE (top set)",
        hintLogAgain:
          "Zabilježite ovaj dan ponovno kako biste usporedili svoj zadnji top set s prethodnim treningom.",
        hintSessionsRecorded:
          "{{sessionsUsed}} sesija zabilježena. Δ je — kada nedostaje vrijednost.",
        hintAllSets: "{{sessionsUsed}} trening(s) s ovom vježbom na ovaj dan.",
        hintTopSetTrend: "Trend top-seta kroz {{sessionsUsed}} sesiju(s).",
        sessionSingular: "sesija",
        sessionPlural: "sesija",
        workoutSingular: "trening",
        workoutPlural: "treninga",
      },
    },
    routineDayPicker: {
      routineSubtitle: "Rutina",
      noRoutinesYet: "Nema rutina još",
      createRoutineFirst: "Najprije kreirajte rutinu na kartici Plan.",
      daySubtitle: "Dan",
      noDaysSelected: "Ova rutina nema odabrane dane.",
    },
    routineCard: {
      expand: "Proširi",
      collapse: "Sažmi",
      daySingular: "dan",
      dayPlural: "dana",
      exerciseCount_one: "{{count}} vježba",
      exerciseCount_few: "{{count}} vježbe",
      exerciseCount_other: "{{count}} vježbi",
      daysLabel: "Dani",
      exercisesLabel: "Vježbe",
      none: "Nema",
      noExercises: "nema vježbi",
      editAccessibilityPrefix: "Uredi",
      edit: "Uredi",
      deleteAccessibilityPrefix: "Obriši",
      delete: "Obriši",
    },
    routineModal: {
      dismiss: "Zatvori",
      duplicateExerciseTitle: "Duplikat vježbe",
      duplicateExerciseMessage:
        "Ta vježba je već dodana za taj dan. Odaberite drugo ime ili uklonite duplikat.",
      editRoutineTitle: "Uredi rutinu",
      newRoutineTitle: "Nova rutina",
      nameLabel: "Naziv",
      closeAccessibilityLabel: "Zatvori",
      routineNamePlaceholder: "npr. Podjela gornjeg dijela",
      routineNameAccessibilityLabel: "Naziv rutine",
      daysLabel: "Dani",
      exercisesByDayLabel: "Vježbe po danu",
      pickDayInstruction: "Odaberite dan, pa dodajte vježbe za taj dan.",
      noExercisesForActiveDayYet: "Nema vježbi za {{activeDay}} još.",
      selectDayToAddExercises: "Odaberite dan za dodavanje vježbi.",
      selectAtLeastOneDayFirst: "Prvo odaberite barem jedan dan.",
      addExercisePlaceholderForDay:
        "Dodaj vježbu za {{activeDay}} (npr. Bench Press 3x8)",
      selectDayAbovePlaceholder: "Odaberite dan iznad",
      addButton: "Dodaj",
      saveChangesButton: "Spremi promjene",
      createButton: "Kreiraj",
    },
  },
};

export default hr;
export type TranslationKeys = keyof typeof hr.translation;
