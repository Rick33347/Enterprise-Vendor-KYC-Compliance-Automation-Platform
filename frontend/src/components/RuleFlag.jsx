export default function RuleFlag({ flag }) {
  const severityClass = `flag-badge severity-${flag.severity.toLowerCase()}`;

  return (
    <div className="flag-item">
      <div className="flag-header">
        <span className={severityClass}>{flag.severity}</span>
        <strong className="flag-id">{flag.rule_id}</strong>
      </div>
      <p className="flag-message">{flag.message}</p>
    </div>
  );
}