declare module "safe-eval" {
  function safeEval(content: string, fileName?: string): any;
  export default safeEval;
}
