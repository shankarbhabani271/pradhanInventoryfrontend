const ErrorMessage = ({ error }: { error?: string }) => {
  if (!error) {
    return null;
  }
  return (
    <span className="text-destructive/90 text-[10px] px-0.5 -mt-0.5">
      {error}
    </span>
  );
};

export default ErrorMessage;