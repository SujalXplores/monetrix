import * as RemixIcons from '@remixicon/react';

/**
 * Common icon utilities to reduce repetition
 * This file creates a factory for consistent icon components
 */

export interface IconProps {
  size?: number;
  className?: string;
}

/**
 * Factory function to create consistent icon components
 */
export const createIcon = (IconComponent: React.ComponentType<any>) => {
  return ({ size = 16, className }: IconProps) => (
    <IconComponent size={size} className={className} />
  );
};

/**
 * Icon component map for dynamic icon selection
 */
export const iconMap = {
  // Bot/AI related icons
  bot: RemixIcons.RiRobotLine,
  user: RemixIcons.RiUserLine,

  // File and attachment icons
  attachment: RemixIcons.RiAttachmentLine,
  paperclip: RemixIcons.RiAttachment2,
  file: RemixIcons.RiFileLine,
  upload: RemixIcons.RiUploadLine,
  image: RemixIcons.RiImageLine,

  // Navigation icons
  chevronDown: RemixIcons.RiArrowDownSLine,
  chevronUp: RemixIcons.RiArrowUpLine,
  arrowUp: RemixIcons.RiArrowUpLine,
  home: RemixIcons.RiHomeLine,

  // Action icons
  add: RemixIcons.RiAddLine,
  edit: RemixIcons.RiEditLine,
  delete: RemixIcons.RiDeleteBinLine,
  copy: RemixIcons.RiFileCopyLine,
  close: RemixIcons.RiCloseLine,
  closeCircle: RemixIcons.RiCloseCircleLine,

  // Status icons
  loader: RemixIcons.RiLoader4Line,
  stop: RemixIcons.RiStopLine,
  info: RemixIcons.RiInformationLine,
  checkCircle: RemixIcons.RiCheckboxCircleFill,
  thumbUp: RemixIcons.RiThumbUpLine,
  thumbDown: RemixIcons.RiThumbDownLine,

  // UI icons
  menu: RemixIcons.RiMenuLine,
  more: RemixIcons.RiMoreLine,
  moreFill: RemixIcons.RiMoreFill,

  // Visibility icons
  globe: RemixIcons.RiGlobalLine,
  lock: RemixIcons.RiLockLine,
  eye: RemixIcons.RiEyeLine,
  share: RemixIcons.RiShareLine,

  // Code icons
  code: RemixIcons.RiCodeLine,
  play: RemixIcons.RiPlayLine,
  python: RemixIcons.RiFileCodeLine,
  terminal: RemixIcons.RiTerminalLine,
  terminalWindow: RemixIcons.RiTerminalBoxLine,

  // Content icons
  message: RemixIcons.RiMessage3Line,
  summarize: RemixIcons.RiFileList3Line,
  logs: RemixIcons.RiFileList2Line,

  // History and version icons
  history: RemixIcons.RiHistoryLine,
  undo: RemixIcons.RiArrowGoBackLine,
  redo: RemixIcons.RiArrowGoForwardLine,
  clockRewind: RemixIcons.RiHistoryLine,

  // Misc icons
  sparkles: RemixIcons.RiSparklingLine,
  fullscreen: RemixIcons.RiFullscreenLine,
  git: RemixIcons.RiGitRepositoryLine,
  triangle: RemixIcons.RiTriangleLine,
  box: RemixIcons.RiBox3Line,
  route: RemixIcons.RiRouteLine,
  mapPin: RemixIcons.RiMapPinLine,
  pen: RemixIcons.RiPenNibLine,
  fileText: RemixIcons.RiFileTextLine,
  sidebarUnfold: RemixIcons.RiSidebarUnfoldLine,
} as const;

export type IconName = keyof typeof iconMap;

/**
 * Dynamic icon component that accepts an icon name
 */
export const DynamicIcon = ({
  name,
  size = 16,
  className,
}: { name: IconName } & IconProps) => {
  const IconComponent = iconMap[name];
  return <IconComponent size={size} className={className} />;
};

// Export individual icon components for backward compatibility
export const BotIcon = createIcon(RemixIcons.RiRobotLine);
export const UserIcon = createIcon(RemixIcons.RiUserLine);
export const AttachmentIcon = createIcon(RemixIcons.RiAttachmentLine);
export const PaperclipIcon = createIcon(RemixIcons.RiAttachment2);
export const FileIcon = createIcon(RemixIcons.RiFileLine);
export const UploadIcon = createIcon(RemixIcons.RiUploadLine);
export const ImageIcon = createIcon(RemixIcons.RiImageLine);
export const ChevronDownIcon = createIcon(RemixIcons.RiArrowDownSLine);
export const ChevronUpIcon = createIcon(RemixIcons.RiArrowUpLine);
export const ArrowUpIcon = createIcon(RemixIcons.RiArrowUpLine);
export const HomeIcon = createIcon(RemixIcons.RiHomeLine);
export const AddIcon = createIcon(RemixIcons.RiAddLine);
export const EditIcon = createIcon(RemixIcons.RiEditLine);
export const DeleteIcon = createIcon(RemixIcons.RiDeleteBinLine);
export const CopyIcon = createIcon(RemixIcons.RiFileCopyLine);
export const CloseIcon = createIcon(RemixIcons.RiCloseLine);
export const CloseCircleIcon = createIcon(RemixIcons.RiCloseCircleLine);
export const LoaderIcon = createIcon(RemixIcons.RiLoader4Line);
export const StopIcon = createIcon(RemixIcons.RiStopLine);
export const InfoIcon = createIcon(RemixIcons.RiInformationLine);
export const CheckCircleFillIcon = createIcon(RemixIcons.RiCheckboxCircleFill);
export const ThumbUpIcon = createIcon(RemixIcons.RiThumbUpLine);
export const ThumbDownIcon = createIcon(RemixIcons.RiThumbDownLine);
export const MenuIcon = createIcon(RemixIcons.RiMenuLine);
export const MoreIcon = createIcon(RemixIcons.RiMoreLine);
export const MoreFillIcon = createIcon(RemixIcons.RiMoreFill);
export const GlobeIcon = createIcon(RemixIcons.RiGlobalLine);
export const LockIcon = createIcon(RemixIcons.RiLockLine);
export const EyeIcon = createIcon(RemixIcons.RiEyeLine);
export const ShareIcon = createIcon(RemixIcons.RiShareLine);
export const CodeIcon = createIcon(RemixIcons.RiCodeLine);
export const PlayIcon = createIcon(RemixIcons.RiPlayLine);
export const PythonIcon = createIcon(RemixIcons.RiFileCodeLine);
export const TerminalIcon = createIcon(RemixIcons.RiTerminalLine);
export const TerminalWindowIcon = createIcon(RemixIcons.RiTerminalBoxLine);
export const MessageIcon = createIcon(RemixIcons.RiMessage3Line);
export const SummarizeIcon = createIcon(RemixIcons.RiFileList3Line);
export const LogsIcon = createIcon(RemixIcons.RiFileList2Line);
export const HistoryIcon = createIcon(RemixIcons.RiHistoryLine);
export const UndoIcon = createIcon(RemixIcons.RiArrowGoBackLine);
export const RedoIcon = createIcon(RemixIcons.RiArrowGoForwardLine);
export const ClockRewind = createIcon(RemixIcons.RiHistoryLine);
export const SparklesIcon = createIcon(RemixIcons.RiSparklingLine);
export const FullscreenIcon = createIcon(RemixIcons.RiFullscreenLine);
export const GitIcon = createIcon(RemixIcons.RiGitRepositoryLine);
export const TriangleIcon = createIcon(RemixIcons.RiTriangleLine);
export const BoxIcon = createIcon(RemixIcons.RiBox3Line);
export const RouteIcon = createIcon(RemixIcons.RiRouteLine);
export const MapPinIcon = createIcon(RemixIcons.RiMapPinLine);
export const PenIcon = createIcon(RemixIcons.RiPenNibLine);
export const FileTextIcon = createIcon(RemixIcons.RiFileTextLine);
export const SidebarLeftIcon = createIcon(RemixIcons.RiSidebarUnfoldLine);
