import { useLocalStorage } from '../hooks/useLocalStorage';

export function MeetingCard({ meeting }: MeetingCardProps) {
  const [icon, setIcon] = useLocalStorage(`meeting-icon-${meeting.id}`, meeting.icon || 'default-icon');
  const [preworkIcon, setPreworkIcon] = useLocalStorage(`prework-icon-${meeting.id}`, 'file-text');
  const [showActions, setShowActions] = useLocalStorage(`show-actions-${meeting.id}`, true);
  const [comment, setComment] = useLocalStorage(`meeting-comment-${meeting.id}`, '');

  return (
    <Card className="mb-2 p-2">
      <div className="flex items-center gap-2">
        <button onClick={() => setIcon(/* show icon picker dialog */)}>
          <Icon name={icon} />
        </button>
        {preworkRequired && (
          <button onClick={() => setPreworkIcon(/* show icon picker dialog */)}>
            <Icon name={preworkIcon} />
          </button>
        )}
        {/* ... rest of card content ... */}
      </div>
      
      {showActions && (
        <div className="mt-2">
          <button onClick={() => handleCancel()}>Cancel</button>
          <button onClick={() => handleReschedule()}>Reschedule</button>
          <button onClick={() => handleShorter()}>Request Shorter</button>
        </div>
      )}
      
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment..."
      />
    </Card>
  );
}