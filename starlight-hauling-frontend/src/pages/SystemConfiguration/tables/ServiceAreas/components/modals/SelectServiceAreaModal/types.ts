import { type IModal } from '@root/common/Modal/types';
import { IServiceArea } from '@root/types';

type onUseServiceAreaFunction = (id: number) => void;
type onCloseFunction = () => void;

export interface ISelectServiceAreaModal extends IModal {
  serviceAreasList: IServiceArea[];
  onSelect: onUseServiceAreaFunction;
  onClose: onCloseFunction;
}
