import { useToastStore } from '../../store/toastStore';

export default function Toast() {
  const { message, visible } = useToastStore();

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5
        px-5 py-3 rounded-full shadow-modal bg-verde-800 text-crema-50
        text-sm font-medium transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}
    >
      <svg className="w-4 h-4 text-dorado-400 flex-none" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd"/>
      </svg>
      {message}
    </div>
  );
}
