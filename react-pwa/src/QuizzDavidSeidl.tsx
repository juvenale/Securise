import React, { useState } from 'react';
import { Badge } from '../ui/Badge';
import { Metric } from '../ui/Metric';
import { ConfidenceSelector } from '../ui/ConfidenceSelector';
import { pct } from '../../utils/stats';

const ALL_FILTER = "all";

export interface QuizzDavidSeidlProps {
  progress: any;
  setProgress: any;
  quizzDavidSeidlQuestions: any[];
  domains: any[];
}

export function QuizzDavidSeidl({ progress, setProgress, quizzDavidSeidlQuestions, domains }: QuizzDavidSeidlProps) {
  const [domainFilter, setDomainFilter] = useState(ALL_FILTER);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [confidence, setConfidence] = useState("medium");
  const [session, setSession] = useState({ total: 0, correct: 0 });

  // Groupement des questions par domaine
  const domainGroups = domains.map((domain) => {
    const items = quizzDavidSeidlQuestions.filter((question) => question.domain === domain.id);
    return { ...domain, items };
  }).filter((domain) => domain.items.length);

  const visibleQuestions = quizzDavidSeidlQuestions.filter((question) => domainFilter === ALL_FILTER || question.domain === domainFilter);
  const currentQuestion = visibleQuestions[index] || visibleQuestions[0];
  
  const answers = progress.quizzDavidSeidl?.answers || {};
  const visibleAnswered = visibleQuestions.filter((item) => answers[item.id]).length;
  const visibleCorrect = visibleQuestions.filter((item) => answers[item.id]?.correct).length;
  const visibleMissed = visibleQuestions.filter((item) => answers[item.id] && !answers[item.id].correct).length;

  function resetQuestionState(nextIndex = 0) {
    setSelected(null);
    setConfidence("medium");
    setIndex(Math.max(0, Math.min(nextIndex, Math.max(visibleQuestions.length - 1, 0))));
  }

  function changeDomain(value: string) {
    setDomainFilter(value);
    setSelected(null);
    setConfidence("medium");
    setIndex(0);
  }

  function answerDavidSeidl(choice: number) {
    if (!currentQuestion || selected !== null) return;
    const correct = choice === currentQuestion.answer;
    const now = Date.now();
    setSelected(choice);
    setSession((state) => ({ total: state.total + 1, correct: state.correct + (correct ? 1 : 0) }));
    
    setProgress((previous: any) => ({
      ...previous,
      quizzDavidSeidl: {
        answers: {
          ...(previous.quizzDavidSeidl?.answers || {}),
          [currentQuestion.id]: {
            questionId: currentQuestion.id,
            answer: choice,
            correct,
            confidence,
            domain: currentQuestion.domain,
            at: now,
            source: "Quizz David Seidl"
          }
        },
        attempts: [
          ...(previous.quizzDavidSeidl?.attempts || []),
          {
            questionId: currentQuestion.id,
            answer: choice,
            correct,
            confidence,
            domain: currentQuestion.domain,
            at: now,
            source: "Quizz David Seidl"
          }
        ].slice(-3000)
      }
    }));
  }

  function nextQuestion() {
    resetQuestionState((index + 1) % Math.max(visibleQuestions.length, 1));
  }

  function previousQuestion() {
    resetQuestionState((index - 1 + Math.max(visibleQuestions.length, 1)) % Math.max(visibleQuestions.length, 1));
  }

  function randomQuestion() {
    resetQuestionState(Math.floor(Math.random() * Math.max(visibleQuestions.length, 1)));
  }

  if (!currentQuestion) {
    return (
      <section className="panel">
        <h3>Aucune question David Seidl n'est disponible</h3>
        <p className="muted">La section est prête, mais la banque de questions n'a pas été chargée.</p>
      </section>
    );
  }

  const savedAnswer = answers[currentQuestion.id];

  return (
    <section className="two-col">
      <div className="panel">
        <div className="filters">
          <select value={domainFilter} onChange={(ev) => changeDomain(ev.target.value)}>
            <option value={ALL_FILTER}>Tous les domaines David Seidl</option>
            {domainGroups.map((domain) => (
              <option key={domain.id} value={domain.id}>D{domain.id} - {domain.name} ({domain.items.length})</option>
            ))}
          </select>
          <button className="ghost random-control" onClick={randomQuestion}>Random</button>
        </div>

        <div className="status-strip" style={{ marginBottom: "16px" }}>
          <Badge label={currentQuestion.sourceTitle || "David Seidl"} tone="ok" />
          <Badge label={`D${currentQuestion.domain}`} />
          <Badge label={`Question ${currentQuestion.number || index + 1}`} />
          <Badge label={`${index + 1}/${visibleQuestions.length}`} />
          {savedAnswer && (
            <Badge label={savedAnswer.correct ? "Déjà réussie" : "À revoir"} tone={savedAnswer.correct ? "ok" : "danger"} />
          )}
        </div>

        <h3 style={{ margin: "20px 0", fontSize: "1.25rem", lineHeight: "1.5" }}>{currentQuestion.prompt}</h3>

        <ConfidenceSelector value={confidence} onChange={setConfidence} disabled={selected !== null} />

        <div className="answers">
          {currentQuestion.options.map((option: string, i: number) => {
            const isCorrect = i === currentQuestion.answer;
            const isChosen = selected === i;
            let btnClass = "";
            if (selected !== null) {
              if (isCorrect) btnClass = "correct";
              else if (isChosen) btnClass = "wrong";
            }
            return (
              <button 
                key={`${currentQuestion.id}-${i}`}
                onClick={() => answerDavidSeidl(i)}
                className={btnClass}
                disabled={selected !== null}
              >
                {String.fromCharCode(65 + i)}. {option}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className={`explanation fade-in ${selected === currentQuestion.answer ? "" : "port-miss"}`} style={{ marginTop: "24px" }}>
            <strong>{selected === currentQuestion.answer ? "Correct" : "Incorrect"}</strong>
            <p>Confidence: {confidence.charAt(0).toUpperCase() + confidence.slice(1)}. {currentQuestion.explanationFr}</p>
          </div>
        )}

        <div className="row-actions" style={{ marginTop: "24px" }}>
          <button className="ghost" onClick={previousQuestion}>Previous</button>
          <div style={{ flex: 1 }}></div>
          <button className="primary" onClick={nextQuestion}>Next</button>
        </div>
      </div>

      <aside className="panel compact">
        <h3>Progression David Seidl</h3>
        <div className="summary-grid mini" style={{ marginBottom: "24px", gridTemplateColumns: "1fr 1fr" }}>
          <Metric label="Filtrées" value={visibleQuestions.length} />
          <Metric label="Répondues" value={`${visibleAnswered}/${visibleQuestions.length}`} />
          <Metric label="Précision" value={`${pct(visibleCorrect, visibleAnswered)}%`} />
          <Metric label="Session" value={`${session.correct}/${session.total}`} />
        </div>

        <div className="section-title" style={{ marginTop: "24px" }}>
          <h4>Filtre par Domaine</h4>
        </div>
        
        <div className="stack" style={{ marginTop: "12px", gap: "10px", display: "flex", flexDirection: "column" }}>
          <button
            className={`mode-card ${domainFilter === ALL_FILTER ? "highlight" : ""}`}
            onClick={() => changeDomain(ALL_FILTER)}
            style={{ padding: "14px", textAlign: "left", width: "100%", cursor: "pointer" }}
          >
            <strong style={{ display: "block", marginBottom: "4px" }}>Tous les domaines</strong>
            <span className="muted" style={{ fontSize: "0.85rem" }}>Vue globale de l'entrainement</span>
          </button>

          {domainGroups.map((domain) => {
            const answered = domain.items.filter((item: any) => answers[item.id]).length;
            const correct = domain.items.filter((item: any) => answers[item.id]?.correct).length;
            const isActive = domainFilter === domain.id;
            const percentage = pct(answered, domain.items.length);
            
            return (
              <button
                key={domain.id}
                className={`mode-card ${isActive ? "highlight" : ""}`}
                onClick={() => changeDomain(domain.id)}
                style={{ padding: "14px", textAlign: "left", display: "flex", flexDirection: "column", gap: "6px", width: "100%", cursor: "pointer" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "baseline" }}>
                  <strong style={{ fontSize: "0.95rem" }}>D{domain.id} - {domain.name}</strong>
                  <strong style={{ color: isActive ? "var(--primary)" : "var(--text)", fontSize: "1.1rem" }}>{pct(correct, answered)}%</strong>
                </div>
                <small className="muted" style={{ fontSize: "0.85rem" }}>{answered}/{domain.items.length} répondues</small>
                
                <div className="bar" style={{ height: "6px", marginTop: "4px", background: "var(--surface-3)", borderRadius: "99px", overflow: "hidden" }}>
                  <i style={{ width: `${percentage}%`, background: "var(--primary)", height: "100%", display: "block", borderRadius: "99px" }}></i>
                </div>
              </button>
            );
          })}
        </div>
      </aside>
    </section>
  );
}