import React, { AriaAttributes } from 'react';

import { getRandomID, isNonNullable } from '../../lib/utils';
import { DropdownContainer, DropdownContainerProps } from '../DropdownContainer';
import { Input, InputIconType, InputProps } from '../../components/Input';
import { InputLikeText } from '../InputLikeText';
import { Menu } from '../Menu';
import { MenuItemState } from '../../components/MenuItem';
import { RenderLayer } from '../RenderLayer';
import { Spinner } from '../../components/Spinner';
import { Nullable } from '../../typings/utility-types';
import { ArrowChevronDownIcon } from '../icons/16px';
import { CommonProps, CommonWrapper } from '../CommonWrapper';
import { MobilePopup } from '../MobilePopup';
import { responsiveLayout } from '../../components/ResponsiveLayout/decorator';
import { rootNode, getRootNode, TSetRootNode } from '../../lib/rootNode';
import { createPropsGetter } from '../../lib/createPropsGetter';
import { isTheme2022 } from '../../lib/theming/ThemeHelpers';
import { ThemeContext } from '../../lib/theming/ThemeContext';
import { Theme } from '../../lib/theming/Theme';
import { LoadingIcon } from '../icons2022/LoadingIcon';
import { ComboBoxExtendedItem } from '../../components/ComboBox';
import { SizeProp } from '../../lib/types/props';

import { ArrowDownIcon } from './ArrowDownIcon';
import { ComboBoxMenu } from './ComboBoxMenu';
import { ComboBoxRequestStatus } from './CustomComboBoxTypes';
import { styles } from './CustomComboBox.styles';
import { CustomComboBoxDataTids } from './CustomComboBox';
import { getComboBoxTheme } from './getComboBoxTheme';

interface ComboBoxViewProps<T>
  extends Pick<DropdownContainerProps, 'menuPos'>,
    Pick<AriaAttributes, 'aria-describedby' | 'aria-label'>,
    CommonProps {
  align?: 'left' | 'center' | 'right';
  autoFocus?: boolean;
  borderless?: boolean;
  disablePortal?: boolean;
  disabled?: boolean;
  editing?: boolean;
  /**
   * Cостояние валидации при ошибке.
   */
  error?: boolean;
  items?: Nullable<Array<ComboBoxExtendedItem<T>>>;
  loading?: boolean;
  menuAlign?: 'left' | 'right';
  opened?: boolean;
  drawArrow?: boolean;
  placeholder?: string;
  size?: SizeProp;
  textValue?: string;
  totalCount?: number;
  value?: Nullable<T>;
  /**
   * Cостояние валидации при предупреждении.
   */
  warning?: boolean;
  width?: string | number;
  maxLength?: number;
  maxMenuHeight?: number | string;
  leftIcon?: InputIconType;
  rightIcon?: InputIconType;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];

  onValueChange?: (value: T) => void;
  onClickOutside?: (e: Event) => void;
  onFocus?: () => void;
  onMobileClose?: () => void;
  onFocusOutside?: () => void;
  onInputBlur?: () => void;
  onInputValueChange?: (value: string) => void;
  onInputFocus?: () => void;
  onInputClick?: () => void;
  onInputKeyDown?: (e: React.KeyboardEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseOver?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
  renderItem?: (item: T, state: MenuItemState) => React.ReactNode;
  itemWrapper?: (item: T) => React.ComponentType<unknown>;
  renderNotFound?: () => React.ReactNode;
  renderTotalCount?: (found: number, total: number) => React.ReactNode;
  renderValue?: (item: T) => React.ReactNode;
  renderAddButton?: (query?: string) => React.ReactNode;
  repeatRequest?: () => void;
  requestStatus?: ComboBoxRequestStatus;
  refInput?: (input: Nullable<Input>) => void;
  refMenu?: (menu: Nullable<Menu>) => void;
  refInputLikeText?: (inputLikeText: Nullable<InputLikeText>) => void;
}

type DefaultProps<T> = Required<
  Pick<
    ComboBoxViewProps<T>,
    | 'renderItem'
    | 'renderValue'
    | 'renderAddButton'
    | 'repeatRequest'
    | 'requestStatus'
    | 'onClickOutside'
    | 'onFocusOutside'
    | 'size'
    | 'width'
  >
>;

export const ComboBoxViewIds = {
  menu: 'ComboBoxView__menu',
};

@responsiveLayout
@rootNode
export class ComboBoxView<T> extends React.Component<ComboBoxViewProps<T>> {
  public static __KONTUR_REACT_UI__ = 'ComboBoxView';
  public static displayName = 'ComboBoxView';

  public static defaultProps: DefaultProps<unknown> = {
    renderItem: (item: any) => item,
    renderValue: (item: any) => item,
    renderAddButton: () => null,
    repeatRequest: () => undefined,
    requestStatus: ComboBoxRequestStatus.Unknown,
    onClickOutside: () => {
      /**/
    },
    onFocusOutside: () => {
      /**/
    },
    size: 'small',
    width: 250,
  };

  private getProps = createPropsGetter(ComboBoxView.defaultProps);

  private input: Nullable<Input>;
  private setRootNode!: TSetRootNode;
  private mobileInput: Nullable<Input> = null;
  private isMobileLayout!: boolean;
  private dropdownContainerRef = React.createRef<DropdownContainer>();
  private theme!: Theme;
  private menuId = ComboBoxViewIds.menu + getRandomID();

  public componentDidMount() {
    if (this.props.autoFocus && this.props.onFocus) {
      this.props.onFocus();
    }
    this.props.opened && this.dropdownContainerRef.current?.position();
  }

  public componentDidUpdate(prevProps: ComboBoxViewProps<T>) {
    const { input, props } = this;

    if (props.editing && !prevProps.editing && input) {
      input.focus();
    }
  }

  public render() {
    return (
      <ThemeContext.Consumer>
        {(theme) => {
          this.theme = getComboBoxTheme(theme);
          return <ThemeContext.Provider value={this.theme}>{this.renderMain()}</ThemeContext.Provider>;
        }}
      </ThemeContext.Consumer>
    );
  }

  public renderMain() {
    const { onMouseEnter, onMouseLeave, onMouseOver, opened } = this.props;
    const { onClickOutside, onFocusOutside, width } = this.getProps();

    const isMobile = this.isMobileLayout;

    const input = this.renderInput();

    return (
      <CommonWrapper {...this.props}>
        <RenderLayer onClickOutside={onClickOutside} onFocusOutside={onFocusOutside} active={opened}>
          <span
            data-tid={CustomComboBoxDataTids.comboBoxView}
            style={{ width }}
            className={styles.root()}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onMouseOver={onMouseOver}
            ref={this.setRootNode}
          >
            {input}
            {isMobile ? this.renderMobileMenu() : this.renderMenu()}
          </span>
        </RenderLayer>
      </CommonWrapper>
    );
  }

  private getComboBoxMenu = () => {
    const { items, loading, opened, refMenu, maxMenuHeight, renderTotalCount, renderNotFound, totalCount, size } =
      this.props;

    const { repeatRequest, requestStatus, renderItem, itemWrapper } = this.getProps();
    return (
      <ComboBoxMenu
        menuId={this.menuId}
        items={items}
        loading={loading}
        maxMenuHeight={maxMenuHeight}
        onValueChange={this.handleItemSelect}
        opened={opened}
        refMenu={refMenu}
        renderTotalCount={renderTotalCount}
        renderItem={renderItem}
        renderNotFound={renderNotFound}
        itemWrapper={itemWrapper}
        renderAddButton={this.renderAddButton}
        repeatRequest={repeatRequest}
        requestStatus={requestStatus}
        totalCount={totalCount}
        isMobile={this.isMobileLayout}
        size={size}
      />
    );
  };

  private renderMenu = () => {
    const { menuAlign, opened, menuPos } = this.props;

    return (
      opened && (
        <DropdownContainer
          menuPos={menuPos}
          align={menuAlign}
          getParent={this.getParent}
          disablePortal={this.props.disablePortal}
          ref={this.dropdownContainerRef}
        >
          {this.getComboBoxMenu()}
        </DropdownContainer>
      )
    );
  };

  private renderMobileMenu = () => {
    let rightIcon = null;

    const { loading, items, opened, onFocus, onInputValueChange, placeholder, textValue } = this.props;
    if (loading && items && !!items.length) {
      rightIcon = this.renderSpinner();
    }

    const inputProps: InputProps = {
      autoFocus: true,
      width: '100%',
      onFocus,
      onValueChange: onInputValueChange,
      value: textValue,
      placeholder,
      rightIcon,
    };

    return (
      opened && (
        <MobilePopup
          headerChildComponent={<Input ref={this.refMobileInput} {...inputProps} />}
          onCloseRequest={this.props.onMobileClose}
          opened
        >
          {this.getComboBoxMenu()}
        </MobilePopup>
      )
    );
  };

  private getParent = () => {
    return getRootNode(this);
  };

  private renderAddButton = (): React.ReactNode => {
    return this.getProps().renderAddButton(this.props.textValue);
  };

  private renderInput(): React.ReactNode {
    const isMobile = this.isMobileLayout;

    const {
      align,
      borderless,
      disabled,
      editing,
      error,
      onFocus,
      onInputBlur,
      onInputValueChange,
      onInputFocus,
      onInputClick,
      onInputKeyDown,
      placeholder,
      textValue,
      value,
      warning,
      refInputLikeText,
      leftIcon,
      inputMode,
      size,
      'aria-describedby': ariaDescribedby,
      'aria-label': ariaLabel,
    } = this.props;

    const { renderValue } = this.getProps();

    const rightIcon = this.getRightIcon();

    if (editing) {
      return (
        <Input
          align={align}
          borderless={borderless}
          disabled={disabled}
          error={error}
          maxLength={this.props.maxLength}
          onBlur={isMobile ? undefined : onInputBlur}
          onValueChange={onInputValueChange}
          onFocus={onInputFocus}
          onClick={isMobile ? this.handleMobileFocus : onInputClick}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          value={textValue || ''}
          onKeyDown={onInputKeyDown}
          placeholder={placeholder}
          width="100%"
          size={size}
          ref={this.refInput}
          warning={warning}
          inputMode={inputMode}
          aria-describedby={ariaDescribedby}
          aria-controls={this.menuId}
          aria-label={ariaLabel}
        />
      );
    }

    return (
      <InputLikeText
        align={align}
        borderless={borderless}
        error={error}
        onFocus={onFocus}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        disabled={disabled}
        warning={warning}
        placeholder={placeholder}
        size={size}
        width="100%"
        ref={refInputLikeText}
        aria-describedby={ariaDescribedby}
        aria-controls={this.menuId}
      >
        {isNonNullable(value) && renderValue ? renderValue(value) : null}
      </InputLikeText>
    );
  }

  private handleMobileFocus = () => {
    this.props.onInputClick?.();

    this.mobileInput?.focus();
  };

  private handleItemSelect = (item: T) => {
    if (this.props.onValueChange) {
      this.props.onValueChange(item);
    }

    if (this.isMobileLayout) {
      this.props.onMobileClose?.();
    }
  };

  private refInput = (input: Nullable<Input>) => {
    if (this.props.refInput) {
      this.props.refInput(input);
    }
    this.input = input;
  };

  private renderSpinner = () => (
    <span className={styles.spinnerWrapper()}>
      <Spinner type="mini" caption="" dimmed />
    </span>
  );

  private getRightIcon = () => {
    const { loading, items, drawArrow, rightIcon, size } = this.props;

    if (loading && items && !!items.length) {
      if (isTheme2022(this.theme)) {
        return <LoadingIcon size={size} />;
      }
      return this.renderSpinner();
    }

    if (rightIcon || drawArrow) {
      if (isTheme2022(this.theme)) {
        return rightIcon || <ArrowDownIcon size={size} />;
      }
      return <span className={styles.rightIconWrapper()}>{rightIcon ?? <ArrowChevronDownIcon />}</span>;
    }

    return null;
  };

  private refMobileInput = (input: Nullable<Input>) => {
    this.mobileInput = input;
  };
}
