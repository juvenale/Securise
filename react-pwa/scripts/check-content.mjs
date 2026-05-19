import fs from "node:fs";
import vm from "node:vm";
import { QUIZZ_DAVID_SEIDL_QUESTIONS } from "../src/data/quizzDavidSeidl.js";

const source = fs.readFileSync(new URL("../src/legacy-app.js", import.meta.url), "utf8")
  .replace(/ReactDOM\.createRoot[\s\S]*$/, "");

const allowedDomainPracticeAnswerHints = ["dp-d4-424", "dp-d5-474"];
const expectedExamTotals = { K: 100, L: 100, M: 100, N: 100, O: 100, P: 100 };

const context = {
  console,
  Math,
  Date,
  setInterval() { return 1; },
  clearInterval() {},
  alert() {},
  window: { addEventListener() {}, removeEventListener() {}, dispatchEvent() {} },
  CustomEvent: class CustomEvent {},
  localStorage: { getItem() { return null; }, setItem() {} },
  React: {
    useState(initial) { return [typeof initial === "function" ? initial() : initial, () => {}]; },
    useEffect() {},
    useMemo(factory) { return factory(); },
    createElement(type, props, ...children) {
      if (typeof type === "function") return type({ ...(props || {}), children });
      return { type, props: props || {}, children };
    }
  }
};

context.window.React = context.React;
context.window.ReactDOM = { createRoot() { return { render() {} }; } };
context.window.QUIZZ_DAVID_SEIDL_QUESTIONS = QUIZZ_DAVID_SEIDL_QUESTIONS;

vm.createContext(context);
vm.runInContext(`${source}
const allowedDomainPracticeAnswerHints = new Set(${JSON.stringify(allowedDomainPracticeAnswerHints)});
this.__content = (() => {
  const exams = examSets.map((set) => ({
    id: set.id,
    total: buildExamQuestions(set.id).length,
    pbqs: buildExamQuestions(set.id).filter((item) => item.examType === "pbq").length
  }));
  const domainCounts = domains.map((domain) => ({
    id: domain.id,
    questions: questions.filter((question) => question.domain === domain.id).length
  }));
  const badActiveQuestions = questions
    .filter((question) => question.id.startsWith("obj-") || question.id === "pe-e1-081" || ((question.id.startsWith("sg-") || question.id.startsWith("pe-") || question.id.startsWith("sx-")) && questionContainsAnswer(question)))
    .map((question) => question.id);
  const badDomainPracticeQuestions = domainPracticeQuestions
    .filter((question) => questionContainsAnswer(question) && !allowedDomainPracticeAnswerHints.has(question.id))
    .map((question) => question.id);
  return {
    questions: questions.length,
    domainPracticeQuestions: domainPracticeQuestions.length,
    quizzDavidSeidlQuestions: quizzDavidSeidlQuestions.length,
    quizzDavidSeidlDomainCounts: domains.map((domain) => ({
      id: domain.id,
      questions: quizzDavidSeidlQuestions.filter((question) => question.domain === domain.id).length
    })),
    pbqs: pbqs.length,
    flashcards: flashcards.length,
    ports: ports.length,
    exams,
    domainCounts,
    badActiveQuestions,
    badDomainPracticeQuestions
  };
})();`, context);

console.log(JSON.stringify(context.__content, null, 2));

if (context.__content.questions !== 1076) process.exit(1);
if (context.__content.domainPracticeQuestions !== 540) process.exit(1);
if (context.__content.quizzDavidSeidlQuestions !== 1005) process.exit(1);
if (!context.__content.quizzDavidSeidlDomainCounts.every((domain) => domain.questions > 0)) process.exit(1);
if (context.__content.pbqs !== 108) process.exit(1);
if (!context.__content.domainCounts.every((domain) => domain.questions >= 160)) process.exit(1);
if (context.__content.badActiveQuestions.length) process.exit(1);
if (context.__content.badDomainPracticeQuestions.length) process.exit(1);
if (!context.__content.exams.every((exam) => exam.total === (expectedExamTotals[exam.id] || 90))) process.exit(1);
if (!["A", "B", "C"].every((id) => context.__content.exams.find((exam) => exam.id === id)?.pbqs === 0)) process.exit(1);
if (!["D", "E", "F", "G", "H", "I", "J"].every((id) => context.__content.exams.find((exam) => exam.id === id)?.pbqs === 5)) process.exit(1);
if (!Object.keys(expectedExamTotals).every((id) => context.__content.exams.find((exam) => exam.id === id)?.pbqs === 0)) process.exit(1);
