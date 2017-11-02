//Taken from https://github.com/vuematerial/vue-material/issues/662#issuecomment-308937275

declare module 'vue-material' {
    import { PluginFunction } from 'vue';

    export type ExportProperty
        = 'install'
        | 'MdCore'
        | 'MdAvatar'
        | 'MdBackdrop'
        | 'MdBottomBar'
        | 'MdButton'
        | 'MdButtonToggle'
        | 'MdCard'
        | 'MdCheckbox'
        | 'MdChips'
        | 'MdDialog'
        | 'MdDivider'
        | 'MdFile'
        | 'MdIcon'
        | 'MdImage'
        | 'MdInputContainer'
        | 'MdLayout'
        | 'MdList'
        | 'MdMenu'
        | 'MdProgress'
        | 'MdRadio'
        | 'MdSelect'
        | 'MdSidenav'
        | 'MdSnackbar'
        | 'MdSpeedDial'
        | 'MdSpinner'
        | 'MdSubheader'
        | 'MdSwitch'
        | 'MdTable'
        | 'MdTabs'
        | 'MdToolbar'
        | 'MdTooltip'
        | 'MdWhiteframe'

    export type Options = {
        [key in ExportProperty]: PluginFunction<never>
    }

    const options: Options

    export default options
}
