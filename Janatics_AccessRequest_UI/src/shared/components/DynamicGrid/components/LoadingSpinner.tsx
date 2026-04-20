function LoadingSpinner() {
  return (
    <div className="border-2.5 h-8 w-8 animate-spin rounded-full border-blue-100 border-t-blue-600">
      <style>{`@keyframes ag-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
export default LoadingSpinner
