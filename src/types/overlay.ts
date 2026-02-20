export interface OverlayProps {
	isOpen: boolean;
  close: () => void;
  unmount: () => void;
}