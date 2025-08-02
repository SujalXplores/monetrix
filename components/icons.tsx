import {
  RiAddLine,
  RiArrowDownSLine,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiArrowUpLine,
  RiAttachment2,
  RiAttachmentLine,
  RiBox3Line,
  RiCheckboxCircleFill,
  RiCloseCircleLine,
  RiCloseLine,
  RiCodeLine,
  RiDeleteBinLine,
  RiEditLine,
  RiEyeLine,
  RiFileCodeLine,
  RiFileCopyLine,
  RiFileLine,
  RiFileList2Line,
  RiFileList3Line,
  RiFileTextLine,
  RiFullscreenLine,
  RiGitRepositoryLine,
  RiGlobalLine,
  RiHistoryLine,
  RiHomeLine,
  RiImageLine,
  RiInformationLine,
  RiLoader4Line,
  RiLockLine,
  RiMapPinLine,
  RiMenuLine,
  RiMessage3Line,
  RiMoreFill,
  RiMoreLine,
  RiPenNibLine,
  RiPlayLine,
  RiRobotLine,
  RiRouteLine,
  RiShareLine,
  RiSidebarUnfoldLine,
  RiSparklingLine,
  RiStopLine,
  RiTerminalBoxLine,
  RiTerminalLine,
  RiThumbDownLine,
  RiThumbUpLine,
  RiTriangleLine,
  RiUploadLine,
  RiUserLine,
} from '@remixicon/react';

interface IconProps {
  size?: number;
  className?: string;
}

export const BotIcon = ({ size = 16, className }: IconProps) => (
  <RiRobotLine size={size} className={className} />
);

export const UserIcon = ({ size = 16, className }: IconProps) => (
  <RiUserLine size={size} className={className} />
);

export const AttachmentIcon = ({ size = 16, className }: IconProps) => (
  <RiAttachmentLine size={size} className={className} />
);

export const PaperclipIcon = ({ size = 16, className }: IconProps) => (
  <RiAttachment2 size={size} className={className} />
);

export const FileIcon = ({ size = 16, className }: IconProps) => (
  <RiFileLine size={size} className={className} />
);

export const UploadIcon = ({ size = 16, className }: IconProps) => (
  <RiUploadLine size={size} className={className} />
);

export const ImageIcon = ({ size = 16, className }: IconProps) => (
  <RiImageLine size={size} className={className} />
);

export const VercelIcon = ({ size = 17, className }: IconProps) => (
  <svg
    height={size}
    strokeLinejoin="round"
    viewBox="0 0 16 16"
    width={size}
    className={className}
    style={{ color: 'currentcolor' }}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 1L16 15H0L8 1Z"
      fill="currentColor"
    />
  </svg>
);

export const GitIcon = ({ size = 16, className }: IconProps) => (
  <RiGitRepositoryLine size={size} className={className} />
);

export const HomeIcon = ({ size = 16 }: { size: number }) => (
  <RiHomeLine size={size} />
);

export const BoxIcon = ({ size = 16 }: { size: number }) => (
  <RiBox3Line size={size} />
);

export const RouteIcon = ({ size = 16, className }: IconProps) => (
  <RiRouteLine size={size} className={className} />
);

export const MenuIcon = ({ size = 16, className }: IconProps) => (
  <RiMenuLine size={size} className={className} />
);

export const SidebarLeftIcon = ({ size = 16, className }: IconProps) => (
  <RiSidebarUnfoldLine size={size} className={className} />
);

export const PlusIcon = ({ size = 16, className }: IconProps) => (
  <RiAddLine size={size} className={className} />
);

export const PencilEditIcon = ({ size = 16, className }: IconProps) => (
  <RiEditLine size={size} className={className} />
);

export const PenIcon = ({ size = 16, className }: IconProps) => (
  <RiPenNibLine size={size} className={className} />
);

export const TrashIcon = ({ size = 16, className }: IconProps) => (
  <RiDeleteBinLine size={size} className={className} />
);

export const CopyIcon = ({ size = 16, className }: IconProps) => (
  <RiFileCopyLine size={size} className={className} />
);

export const UndoIcon = ({ size = 16, className }: IconProps) => (
  <RiArrowGoBackLine size={size} className={className} />
);

export const RedoIcon = ({ size = 16, className }: IconProps) => (
  <RiArrowGoForwardLine size={size} className={className} />
);

// More/Options icons
export const MoreIcon = ({ size = 16, className }: IconProps) => (
  <RiMoreLine size={size} className={className} />
);

export const MoreHorizontalIcon = ({ size = 16, className }: IconProps) => (
  <RiMoreFill size={size} className={className} />
);

// Close/Cancel icons
export const CrossIcon = ({ size = 16, className }: IconProps) => (
  <RiCloseLine size={size} className={className} />
);

export const CrossSmallIcon = ({ size = 16, className }: IconProps) => (
  <RiCloseCircleLine size={size} className={className} />
);

export const ArrowUpIcon = ({ size = 16, className }: IconProps) => (
  <RiArrowUpLine size={size} className={className} />
);

export const ChevronDownIcon = ({ size = 16, className }: IconProps) => (
  <RiArrowDownSLine size={size} className={className} />
);

export const LoaderIcon = ({ size = 16, className }: IconProps) => (
  <RiLoader4Line size={size} className={className} />
);

export const StopIcon = ({ size = 16, className }: IconProps) => (
  <RiStopLine size={size} className={className} />
);

export const InfoIcon = ({ size = 16, className }: IconProps) => (
  <RiInformationLine size={size} className={className} />
);

export const CheckCircleFillIcon = ({ size = 16, className }: IconProps) => (
  <RiCheckboxCircleFill size={size} className={className} />
);

export const ThumbUpIcon = ({ size = 16, className }: IconProps) => (
  <RiThumbUpLine size={size} className={className} />
);

export const ThumbDownIcon = ({ size = 16, className }: IconProps) => (
  <RiThumbDownLine size={size} className={className} />
);

export const SparklesIcon = ({ size = 16, className }: IconProps) => (
  <RiSparklingLine size={size} className={className} />
);

export const GlobeIcon = ({ size = 16, className }: IconProps) => (
  <RiGlobalLine size={size} className={className} />
);

export const LockIcon = ({ size = 16, className }: IconProps) => (
  <RiLockLine size={size} className={className} />
);

export const EyeIcon = ({ size = 16, className }: IconProps) => (
  <RiEyeLine size={size} className={className} />
);

export const ShareIcon = ({ size = 16, className }: IconProps) => (
  <RiShareLine size={size} className={className} />
);

// Code and development icons
export const CodeIcon = ({ size = 16, className }: IconProps) => (
  <RiCodeLine size={size} className={className} />
);

export const PlayIcon = ({ size = 16, className }: IconProps) => (
  <RiPlayLine size={size} className={className} />
);

export const PythonIcon = ({ size = 16, className }: IconProps) => (
  <RiFileCodeLine size={size} className={className} />
);

export const TerminalWindowIcon = ({ size = 16, className }: IconProps) => (
  <RiTerminalBoxLine size={size} className={className} />
);

export const TerminalIcon = ({ size = 16, className }: IconProps) => (
  <RiTerminalLine size={size} className={className} />
);

export const MessageIcon = ({ size = 16, className }: IconProps) => (
  <RiMessage3Line size={size} className={className} />
);

export const SummarizeIcon = ({ size = 16, className }: IconProps) => (
  <RiFileList3Line size={size} className={className} />
);

export const LogsIcon = ({ size = 16, className }: IconProps) => (
  <RiFileList2Line size={size} className={className} />
);

export const InvoiceIcon = ({ size = 16 }: { size: number }) => (
  <RiFileTextLine size={size} />
);

export const GPSIcon = ({ size = 16 }: { size: number }) => (
  <RiMapPinLine size={size} />
);

export const DeltaIcon = ({ size = 16, className }: IconProps) => (
  <RiTriangleLine size={size} className={className} />
);

export const FullscreenIcon = ({ size = 16, className }: IconProps) => (
  <RiFullscreenLine size={size} className={className} />
);

export const ClockRewind = ({ size = 16, className }: IconProps) => (
  <RiHistoryLine size={size} className={className} />
);
