declare module "*.jpeg" {
  const value: number;
  export default value;
}
declare module "*.jpg" {
  const value: number;
  export default value;
}
declare module "*.png" {
  const value: number;
  export default value;
}
declare module "*.mp3" {
  const value: number;
  export default value;
}
declare module "*.wav" {
  const value: number;
  export default value;
}
declare module "*.mp4" {
  const value: number;
  export default value;
}
declare module "*.svg" {
  const value: number;
  export default value;
}
declare module "*.ttf" {
  const value: number;
  export default value;
}

declare const process: {
  env: {
    EXPO_PUBLIC_API_URL?: string;
  };
};
