import {
    ScriptTarget,
    Project, createWrappedNode, ClassDeclaration, IndentationText, NewLineKind, QuoteKind, FormatCodeSettings,
    UserPreferences, SourceFile, MethodDeclaration
} from 'ts-morph';
import * as path from 'path';
import { HEADER, Configuration, BuildOptions } from '../builder-models/interfaces';
import { ModuleKind, ModuleResolutionKind, SyntaxKind } from 'typescript';

export class MethodusProject {
    project: Project;
    sourceFiles: any[];

    constructor(public projectPath: string, public packageName: string, options: BuildOptions) {

        const activeOptions: Record<string, unknown> = {};
        if (!options.tsConfig) {
            activeOptions.compilerOptions = {
                target: ScriptTarget.ES5,
                module: ModuleKind.CommonJS,
                moduleResolution: ModuleResolutionKind.NodeJs,
                declaration: true,
                sourceMap: true,
                preserveConstEnums: true,
                emitDecoratorMetadata: true,
                experimentalDecorators: true,
                outDir: `${projectPath}/lib`,
            }
        } else {
            activeOptions.tsConfigFilePath = options.tsConfig;
        }

        this.project = new Project({
            manipulationSettings: {
                // TwoSpaces, FourSpaces, EightSpaces, or Tab
                indentationText: IndentationText.Tab,
                // LineFeed or CarriageReturnLineFeed
                newLineKind: NewLineKind.CarriageReturnLineFeed,
                // Single or Double
                quoteKind: QuoteKind.Single,
                // Whether to change shorthand property assignments to property assignments
                // and add aliases to import & export specifiers (see more information in
                // the renaming section of the documentation).
                usePrefixAndSuffixTextForRename: false
            },
            ...activeOptions
        });

        this.project.addExistingSourceFiles(`${projectPath}/src/**/*{.ts}`);
        this.sourceFiles = this.project.getSourceFiles();
    }

    HandleConstructor(constructor, options: BuildOptions) {
        if (options.isClient) {
            constructor.getParameters().forEach((param) => {
                const decorators = param.getDecorators();
                if (decorators.length) {
                    const decoratorRef = decorators[0];
                    if (decoratorRef.getText().indexOf('@M.') !== 0) {
                        decoratorRef.replaceWithText(`@M.${decoratorRef.getText().substr(1)}`)
                    }
                }
            });
        }
    }

    HandleMethod(method: MethodDeclaration, options: BuildOptions) {

        method.getDecorators().forEach((decoratorRef) => {
            if (decoratorRef.getName() === 'Method' || decoratorRef.getName() === 'MethodPipe') {
                decoratorRef.getArguments().forEach((argument, index) => {
                    if (index > 1) {
                        try {
                            decoratorRef.removeArgument(argument);
                            return;
                        } catch (error) {
                            console.error(error);
                        }
                    }
                    try {
                        if (options.isClient && argument.getText().indexOf('Verbs.') === 0) {
                            argument.replaceWithText(`M.${argument.getText()}`)
                        }
                    } catch (error) {
                        console.error(error);
                    }
                });


            }
            if (options.isClient) {
                try {
                    if (decoratorRef.getText().indexOf('@M.') !== 0) {
                        decoratorRef.replaceWithText(`@M.${decoratorRef.getText().substr(1)}`)
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        });



        const xparams = method.getParameters();

        xparams.forEach((arg, i) => {
            const paramDecorator = arg.getDecorators();
            if (paramDecorator && paramDecorator[0] && paramDecorator[0].getName() === 'SecurityContext') {
                arg.remove();
            } else {
                if (paramDecorator[0] && paramDecorator[0].getText().indexOf('@M') !== 0) {
                    if (options.isClient) {
                        paramDecorator[0].replaceWithText(`@M.P.${paramDecorator[0].getText().substr(1)}`)
                    }
                    else {
                        paramDecorator[0].replaceWithText(`@Mapping.${paramDecorator[0].getText().substr(1)}`)
                    }

                }
            }
        });

        options.isMocked = this.HandleClientMethods(method, options);
        this.HandleMethodReturn(method, options);
        options.isMocked = false;
    }

    HandleClientMethods(method, options: BuildOptions) {
        if (options.isClient) {
            method.getDecorators().forEach((decoratorRef) => {
                if (decoratorRef && decoratorRef.getName() === 'MethodMock') {
                    const struct = decoratorRef.getStructure();
                    const mockResult = (struct.arguments && struct.arguments.length > 0) ? struct.arguments[0] : null;
                    decoratorRef.remove();
                    method.getStatements().forEach((statement) => {
                        statement.remove();
                    });

                    const methodStruct = method.getStructure();

                    const argsRow = (methodStruct.parameters) ? methodStruct.parameters.map((argument) => {
                        return argument.name;
                    }).join(',') : '';


                    method.setBodyText(writer => writer.writeLine(`return  ${mockResult}.apply(this, [${argsRow}]);`));
                    this.project.saveSync();
                    options.isMocked = true;
                }
            });
        }
        return options.isMocked;
    }
    HandleMethodReturn(method: MethodDeclaration, options: BuildOptions) {
        if (!options.isMocked) {
            method.getStatements().forEach((statement) => {
                statement.remove();
            });
        }

        if (method.getReturnTypeNode()) {
            const returnType = method.getReturnTypeNode();
            if (returnType) {
                let retTypeText = returnType.getText()
                if (retTypeText.indexOf('Promise<') > -1) {
                    retTypeText = retTypeText.replace('Promise<', '');
                    retTypeText = retTypeText.substr(0, retTypeText.length - 1);
                }

                if (options.isClient) {
                    if (retTypeText.indexOf('MethodResult<') > -1) {
                        retTypeText = retTypeText.replace('MethodResult<', '');
                        retTypeText = retTypeText.substr(0, retTypeText.length - 1);
                    }
                    if (retTypeText === 'MethodResult') {
                        retTypeText = 'any';
                    }
                    const retNode = method.getReturnTypeNode()
                    if (retNode) {
                        retNode.replaceWithText(`Promise<${retTypeText}>`);
                    }
                }


                if (!options.isMocked && method.getBody()) {
                    const methodBody = method.getBody();
                    if (methodBody) {
                        method.insertText(methodBody.getEnd() - 1, `        return null! as ${retTypeText};\n    `);
                    }
                }
            }
        }
    }

    HandleIncludeFile(sourceFile, dirName: string, options: BuildOptions) {
        const basePath = path.join(this.projectPath, 'src', 'includes');
        this.project.createDirectory(basePath);
        this.project.saveSync();

        const filePath = path.join(basePath, sourceFile.getBaseName());
        const targetFile = this.project.createSourceFile(filePath, sourceFile.getStructure(), { overwrite: true });
        if (options.isClient) {
            targetFile.getImportDeclarations().forEach((importDec) => {
                if (importDec.getText().indexOf('@methodus/server') > -1) {
                    importDec.replaceWithText(`import * as M from '@methodus/platform-web'`);
                }
            });
        }

        targetFile.saveSync();
    }





    ProxifyFromFile(file, dirName: string, contractKey, options: BuildOptions) {

        const basePath = path.join(this.projectPath, 'src', dirName);
        this.project.createDirectory(basePath);
        this.project.saveSync();

        // create the file
        const sourceFile = this.project.createSourceFile(path.join(basePath, `${file.getBaseName()}`), undefined, { overwrite: true });
        sourceFile.insertText(0, writer => writer.writeLine(HEADER));

        const classes = file.getClasses();
        if (classes) {
            if (!options.isClient) {
                sourceFile.addImportDeclaration({
                    moduleSpecifier: '@methodus/framework-decorators',
                    namedImports: ['Proxy', 'MethodConfig', 'Method']
                });
                sourceFile.addImportDeclaration({
                    moduleSpecifier: '@methodus/framework-decorators/commons',
                    namedImports: ['Mapping', 'MethodResult', 'MethodResultStatus']
                });
                sourceFile.addImportDeclaration({
                    moduleSpecifier: '@methodus/platform-rest',
                    namedImports: ['Verbs']
                });
            } else {
                sourceFile.addImportDeclaration({
                    moduleSpecifier: '@methodus/platform-web',
                    namespaceImport: 'M'
                });
            }
            sourceFile.addImportDeclaration({
                moduleSpecifier: `../models`,

            });

            sourceFile.addImportDeclaration({
                moduleSpecifier: `../contracts`,

            });


            const classDec = createWrappedNode(classes[0].compilerNode) as ClassDeclaration;


            try {
                const targetClass = sourceFile.addClass(classDec.getStructure());
                // //methodConfig decorator
                targetClass.getDecorators().forEach((decoratorRef) => {
                    if (decoratorRef.getName() === 'MethodConfig' || decoratorRef.getName() === 'MethodConfigBase') {
                        decoratorRef.getArguments().forEach((argument, index) => {
                            if (index === 1) {
                                try {
                                    argument.replaceWithText('[]');
                                } catch (error) {
                                    console.error(error);
                                }
                            }
                        });
                    }

                    if (options.isClient && decoratorRef.getText().indexOf('@M.') !== 0) {
                        decoratorRef.replaceWithText(`@M.${decoratorRef.getText().substr(1)}`)
                    }
                });

                if (!options.isClient) {
                    const relativeFilename = file.getFilePath().replace(process.cwd().replace(/\\/g, '/'), '');
                    targetClass.insertDecorator(0, {
                        name: 'Proxy.ProxyClass',
                        arguments: [`'${this.packageName}'`, `'${classDec.getName()}'`, `'.${relativeFilename}'`]
                    });
                }

                targetClass.getConstructors().forEach((method) => {
                    this.HandleConstructor(method, options);
                });

                targetClass.getMethods().forEach((method: MethodDeclaration) => {
                    if (!method.hasModifier(SyntaxKind.PrivateKeyword)) {
                        this.HandleMethod(method, options);
                    } else {
                        method.remove();
                    }
                });

                if (options.isClient) {
                    sourceFile.addStatements(`new ${classDec.getName()}()`);
                }

                sourceFile.fixMissingImports({}, { disableSuggestions: true });
                sourceFile.saveSync();


            } catch (error) {
                console.error(error);
            }
        }
    }


    ProxifyFromModel(file, dirName: string, modelKey: string) {
        const basePath = path.join(this.projectPath, 'src', dirName);
        this.project.createDirectory(basePath);
        this.project.saveSync();


        // create the file
        const sourceFile = this.project.createSourceFile(path.join(basePath, `${file.getBaseName()}`), undefined, { overwrite: true });


        const classes = file.getClasses();
        if (!classes[0]) {
            console.log(`file ${file.getFilePath()} doesn't contain a class model`);
            return;
        }
        const classDec = createWrappedNode(classes[0].compilerNode) as ClassDeclaration;
        const modelClass = sourceFile.addClass(classDec.getStructure());


        modelClass.getProperties().forEach((prop) => {
            prop.getDecorators().forEach((decorator) => {
                decorator.remove();
            });
        });

        modelClass.removeExtends();
        const constructor = modelClass.getConstructors()[0];
        if (constructor) {
            constructor.removeBody().addBody();
        }
        modelClass.getDecorators().forEach((decorator) => {
            decorator.remove();
        });


        const format: FormatCodeSettings = {

        }

        const prefernces: UserPreferences = {
            importModuleSpecifierPreference: 'non-relative'
        }

        try {

            sourceFile.fixMissingImports(format, prefernces);

            sourceFile.saveSync();
        } catch (error) {
            console.error(file.getFilePath());
            console.error(error);
        }
    }



    Exportify(buildConfiguration: Configuration): SourceFile {
        const indexPath = path.join(this.projectPath, 'src', 'index.ts');
        const indexFile = this.project.createSourceFile(indexPath, undefined, { overwrite: true });

        ['models', 'includes', 'contracts'].forEach((name) => {
            if (buildConfiguration[name] && Object.keys(buildConfiguration[name]).length > 0) {
                indexFile.addExportDeclaration({
                    moduleSpecifier: `./${name}/`,

                });
            }
        });
        indexFile.saveSync();
        return indexFile;
    }



}
