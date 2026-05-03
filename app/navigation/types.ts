export type RootTabParamList = {
  Modules: undefined;
  Auth: undefined;
  Profil: undefined;
};

export type QuizParams =
  | {
      quizId?: string;
      quizTitle?: string;
      difficulty?: 'easy' | 'medium' | 'hard';
    }
  | undefined;

export type CourseDetailsParams = {
  courseCode: string;
  courseTitle?: string;
  moduleTitle?: string;
  autoStart?: boolean;
};

export type CourseVideoParams = {
  courseCode: string;
  courseTitle?: string;
  moduleTitle?: string;
  videoUrl?: string;
};

export type ModulesStackParamList = {
  ModulesHome: undefined;
  CourseDetails: CourseDetailsParams;
  CourseVideo: CourseVideoParams;
  QuizDetails: QuizParams;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  ExportReport: undefined;
  AttemptsReport: undefined;
};
